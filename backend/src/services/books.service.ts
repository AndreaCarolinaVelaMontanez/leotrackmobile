import { prisma } from '../utils/prisma';
import { searchGoogleBooks } from './googleBooks.service';
import { ManualBookInput } from '../validators/books';

export async function search(query: string) {
  const results = await searchGoogleBooks(query);

  // Upsert books into our DB so they have stable IDs
  const books = await Promise.all(
    results.map(async (r) => {
      const book = await prisma.book.upsert({
        where: { googleBookId: r.googleBookId },
        update: {},
        create: {
          title: r.title,
          author: r.author,
          category: r.category,
          coverUrl: r.coverUrl,
          pageCount: r.pageCount,
          language: r.language,
          googleBookId: r.googleBookId,
          source: 'GOOGLE',
        },
      });
      return book;
    })
  );

  return books;
}

export async function createManual(input: ManualBookInput) {
  const book = await prisma.book.create({
    data: {
      title: input.title,
      author: input.author,
      category: input.category || null,
      pageCount: input.pageCount,
      language: input.language || null,
      source: 'MANUAL',
    },
  });
  return book;
}
