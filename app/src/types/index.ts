export interface User {
  id: string;
  name: string;
  email: string;
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

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  currentPage: number;
  totalMinutes: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  book: Book;
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
  daysActive: number;
  categories: { name: string; minutes: number }[];
  daily: { date: string; minutes: number; pages: number }[];
  period: string;
  from: string;
  to: string;
}

export interface UserBookDetail extends UserBook {
  progressLogs: ProgressLog[];
  readingSessions: ReadingSession[];
}
