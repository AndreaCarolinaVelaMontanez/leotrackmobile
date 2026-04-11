export interface User {
  id: string;
  name: string;
  email: string;
  country?: string | null;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  language: string | null;
  googleBookId: string | null;
  source: 'GOOGLE' | 'MANUAL';
  createdAt: string;
}

export type ReadingStatus = 'READING' | 'FINISHED' | 'WISHLIST' | 'ABANDONED';

export interface BookTag {
  id: string;
  userBookId: string;
  tag: string;
  createdAt: string;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  currentPage: number;
  totalMinutes: number;
  startedAt: string | null;
  finishedAt: string | null;
  recommended: boolean | null;
  createdAt: string;
  updatedAt: string;
  book: Book;
  bookTags?: BookTag[];
}

export interface ProgressLog {
  id: string;
  userBookId: string;
  pagesRead: number;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  userBookId: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  language: 'EN' | 'ES';
  theme: 'LIGHT' | 'DARK';
}

export interface StatsSummary {
  totalMinutes: number;
  totalPages: number;
  completedBooks: number;
  activeDays: string[];
  categories: { name: string; pages: number }[];
  period: string;
  from: string;
  to: string;
  allTime: {
    totalBooks: number;
    finishedBooks: number;
    totalMinutes: number;
    totalPages: number;
    monthsElapsed: number;
  };
}

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

export interface UserBookDetail extends UserBook {
  progressLogs: ProgressLog[];
  readingSessions: ReadingSession[];
  bookTags: BookTag[];
}
