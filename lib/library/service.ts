import type { BookSearchRequest, BookSearchResponse, LibrarySearchService } from "./types";

class Data4LibrarySearchService implements LibrarySearchService {
  async search(request: BookSearchRequest): Promise<BookSearchResponse> {
    const query = request.query.trim();
    if (!query) {
      throw new Error("검색어를 입력해 주세요.");
    }

    const response = await fetch(`/api/library-search?q=${encodeURIComponent(query)}`, {
      headers: { accept: "application/json" },
    });

    const body = (await response.json().catch(() => null)) as (BookSearchResponse & { error?: string }) | null;
    if (!response.ok || !body) {
      throw new Error(body?.error || "정보나루 검색 결과를 불러오지 못했어요.");
    }

    return body;
  }
}

export const librarySearchService: LibrarySearchService = new Data4LibrarySearchService();
