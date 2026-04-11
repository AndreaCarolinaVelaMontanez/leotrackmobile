import https from 'https';

interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    pageCount?: number;
    language?: string;
  };
}

interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
}

export interface NormalizedBook {
  googleBookId: string;
  title: string;
  author: string;
  category: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  language: string | null;
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        if (status < 200 || status >= 300) {
          reject(new Error(`Google Books HTTP ${status}: ${data.slice(0, 200)}`));
          return;
        }
        resolve(data);
      });
      res.on('error', reject);
    });

    req.setTimeout(10000, () => {
      req.destroy(new Error('Google Books request timeout'));
    });
    req.on('error', reject);
  });
}

export async function searchGoogleBooks(query: string): Promise<NormalizedBook[]> {
  const encoded = encodeURIComponent(query);
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=20${keyParam}`;

  const raw = await httpsGet(url);
  const data = JSON.parse(raw) as GoogleBooksResponse & { error?: { message?: string } };

  if (data.error) {
    throw new Error(`Google Books API error: ${data.error.message || 'Unknown error'}`);
  }

  if (!data.items) return [];

  return data.items.map((item) => ({
    googleBookId: item.id,
    title: item.volumeInfo.title || 'Unknown Title',
    author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
    category: item.volumeInfo.categories?.[0] || null,
    coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
    pageCount: item.volumeInfo.pageCount || null,
    language: item.volumeInfo.language || null,
  }));
}
