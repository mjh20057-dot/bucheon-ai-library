export type BookHolding = {
  libraryId: string;
  libraryName: string;
  callNumber: string;
  available: boolean;
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
};

export type BookSearchRequest = {
  query: string;
};

export type BookSearchResponse = {
  items: BookSearchResult[];
  source: "mock" | "data4library";
};

export interface LibrarySearchService {
  search(request: BookSearchRequest): Promise<BookSearchResponse>;
}
