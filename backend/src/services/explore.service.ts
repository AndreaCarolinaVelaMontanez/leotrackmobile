import { prisma } from '../utils/prisma';

export interface ExploreBook {
  bookId: string;
  title: string;
  author: string;
  category: string | null;
  coverUrl: string | null;
  recCount: number;
  tags: string[];
}

export interface ExploreCategory {
  name: string;
  recCount: number;
  books: ExploreBook[];
}

export interface ExploreRating {
  tag: string;
  recCount: number;
  books: ExploreBook[];
}

export interface ExploreData {
  topBooks: ExploreBook[];
  byCategory: ExploreCategory[];
  byRating: ExploreRating[];
}

// Normalize key by title+author to deduplicate books added by different users
// (manual books each get a new book.id, so we must group by content identity)
function bookNormalizeKey(title: string, author: string): string {
  return `${title.toLowerCase().trim()}|||${author.toLowerCase().trim()}`;
}

export async function getExploreData(): Promise<ExploreData> {
  // All finished + recommended user_books with their tags and book info
  // DB-6: cap at 500 most recent to avoid unbounded cross-user query
  const userBooks = await prisma.userBook.findMany({
    where: { status: 'FINISHED', recommended: true },
    include: {
      book: true,
      bookTags: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });

  // Aggregate recommendations per book, deduplicated by title+author
  const bookMap = new Map<string, ExploreBook>();

  for (const ub of userBooks) {
    const { book, bookTags } = ub;
    const key = bookNormalizeKey(book.title, book.author);
    const existing = bookMap.get(key);
    const tags = bookTags.map((bt) => bt.tag);

    if (existing) {
      existing.recCount += 1;
      // Prefer the record that has a cover URL (Google Books version)
      if (!existing.coverUrl && book.coverUrl) {
        existing.coverUrl = book.coverUrl;
        existing.bookId = book.id;
      }
      // Prefer category if missing
      if (!existing.category && book.category) {
        existing.category = book.category;
      }
      // Merge unique tags
      for (const tag of tags) {
        if (!existing.tags.includes(tag)) {
          existing.tags.push(tag);
        }
      }
    } else {
      bookMap.set(key, {
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        coverUrl: book.coverUrl,
        recCount: 1,
        tags,
      });
    }
  }

  const allBooks = Array.from(bookMap.values()).sort((a, b) => b.recCount - a.recCount);

  // Top books (up to 10)
  const topBooks = allBooks.slice(0, 10);

  // Group by category
  const categoryMap = new Map<string, ExploreBook[]>();
  for (const book of allBooks) {
    const cat = book.category || 'Sin categoría';
    const list = categoryMap.get(cat) ?? [];
    list.push(book);
    categoryMap.set(cat, list);
  }

  const byCategory: ExploreCategory[] = Array.from(categoryMap.entries())
    .map(([name, books]) => ({
      name,
      recCount: books.reduce((sum, b) => sum + b.recCount, 0),
      books,
    }))
    .sort((a, b) => b.recCount - a.recCount);

  // Group by rating tag
  const ratingMap = new Map<string, ExploreBook[]>();
  for (const ub of userBooks) {
    for (const bt of ub.bookTags) {
      const tag = bt.tag;
      const list = ratingMap.get(tag) ?? [];
      const book = bookMap.get(bookNormalizeKey(ub.book.title, ub.book.author));
      if (book && !list.find((b) => b.bookId === book.bookId)) {
        list.push(book);
      }
      ratingMap.set(tag, list);
    }
  }

  // Count distinct users per tag
  const tagCountMap = new Map<string, number>();
  for (const ub of userBooks) {
    for (const bt of ub.bookTags) {
      tagCountMap.set(bt.tag, (tagCountMap.get(bt.tag) ?? 0) + 1);
    }
  }

  const byRating: ExploreRating[] = Array.from(ratingMap.entries())
    .map(([tag, books]) => ({
      tag,
      recCount: tagCountMap.get(tag) ?? books.length,
      books: books.sort((a, b) => b.recCount - a.recCount),
    }))
    .sort((a, b) => b.recCount - a.recCount);

  return { topBooks, byCategory, byRating };
}
