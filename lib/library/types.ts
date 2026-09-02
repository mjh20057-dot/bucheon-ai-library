export type BookHolding = {
  libraryId: string;
  libraryName: string;
  callNumber?: string;
  available: boolean | null;
};

export type BookSearchResult = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishedYear: number;
  description: string;
  subjects: string[];
  keywords: string[];
  holdings: BookHolding[];
  isbn13?: string;
  detailUrl?: string;
};

export type BookSearchRequest = {
  query: string;
};

export type BookSearchResponse = {
  items: BookSearchResult[];
  source: "data4library";
  queriedAt?: string;
};

export interface LibrarySearchService {
  search(request: BookSearchRequest): Promise<BookSearchResponse>;
}
