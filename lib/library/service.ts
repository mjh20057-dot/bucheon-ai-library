import { mockBooks } from "./mock-data";
import type { BookSearchRequest, BookSearchResponse, LibrarySearchService } from "./types";

class MockLibrarySearchService implements LibrarySearchService {
  async search(request: BookSearchRequest): Promise<BookSearchResponse> {
    await new Promise((resolve) => setTimeout(resolve, 320));

    const terms = request.query
      .toLocaleLowerCase("ko")
      .split(/\s+/)
      .map((term) => term.replace(/[^0-9a-zA-Z가-힣]/g, ""))
      .filter((term) => term.length > 0);

    if (terms.length === 0) {
      return { items: mockBooks, source: "mock" };
    }

    const scored = mockBooks
      .map((book) => {
        const searchableText = [
          book.title,
          book.author,
          book.description,
          ...book.subjects,
          ...book.keywords,
        ]
          .join(" ")
          .toLocaleLowerCase("ko");

        const score = terms.reduce((total, term) => total + (searchableText.includes(term) ? 1 : 0), 0);
        return { book, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ book }) => book);

    return { items: scored, source: "mock" };
  }
}

export const mockLibrarySearchService: LibrarySearchService = new MockLibrarySearchService();
