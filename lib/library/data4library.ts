import type { BookHolding, BookSearchResponse, BookSearchResult } from "./types";

const API_BASE_URL = "https://data4library.kr/api";
const BUCHEON_REGION_CODE = "31";
const BUCHEON_DETAIL_REGION_CODE = "41190";
const RESULT_LIMIT = 6;
const HOLDING_LIMIT = 4;

type JsonRecord = Record<string, unknown>;
type Fetcher = typeof fetch;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function textValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function unwrapList(value: unknown, key: string): JsonRecord[] {
  return asArray(value).map((item) => {
    const record = asRecord(item);
    return Object.keys(asRecord(record[key])).length > 0 ? asRecord(record[key]) : record;
  });
}

async function fetchApi(path: string, params: Record<string, string>, authKey: string, fetcher: Fetcher): Promise<JsonRecord> {
  const url = new URL(`${API_BASE_URL}/${path}`);
  url.search = new URLSearchParams({ ...params, authKey, format: "json" }).toString();

  const response = await fetcher(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Data4Library request failed: ${response.status}`);
  }

  const payload = asRecord(await response.json());
  const apiResponse = asRecord(payload.response);
  if (apiResponse.error) {
    throw new Error("Data4Library returned an API error");
  }
  return apiResponse;
}

function normalizeSearchKeyword(query: string): string {
  const stopWords = new Set(["책", "도서", "찾아줘", "찾아주세요", "추천", "추천해줘", "추천해주세요", "읽고", "싶은", "관련"]);
  const words = query
    .replace(/[^0-9a-zA-Z가-힣\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0 && !stopWords.has(word));
  return words.join(" ") || query.trim();
}

function normalizeYear(value: unknown): number {
  const match = textValue(value).match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function normalizeSubjects(doc: JsonRecord): string[] {
  const candidates = [doc.class_nm, doc.className, doc.kdc, doc.class_no]
    .map(textValue)
    .filter(Boolean);
  return [...new Set(candidates)].slice(0, 2);
}

async function findBucheonLibraries(isbn13: string, authKey: string, fetcher: Fetcher): Promise<JsonRecord[]> {
  const response = await fetchApi(
    "libSrchByBook",
    {
      isbn: isbn13,
      region: BUCHEON_REGION_CODE,
      dtl_region: BUCHEON_DETAIL_REGION_CODE,
      pageNo: "1",
      pageSize: String(HOLDING_LIMIT),
    },
    authKey,
    fetcher,
  );
  return unwrapList(response.libs, "lib").slice(0, HOLDING_LIMIT);
}

async function checkAvailability(libCode: string, isbn13: string, authKey: string, fetcher: Fetcher): Promise<boolean | null> {
  try {
    const response = await fetchApi("bookExist", { libCode, isbn13 }, authKey, fetcher);
    const result = asRecord(response.result);
    if (textValue(result.hasBook).toUpperCase() !== "Y") return null;
    const value = textValue(result.loanAvailable).toUpperCase();
    return value === "Y" ? true : value === "N" ? false : null;
  } catch {
    return null;
  }
}

async function enrichBook(doc: JsonRecord, query: string, authKey: string, fetcher: Fetcher): Promise<BookSearchResult | null> {
  const isbn13 = textValue(doc.isbn13 || doc.isbn);
  const title = textValue(doc.bookname || doc.bookName || doc.title);
  if (!isbn13 || !title) return null;

  let libraries: JsonRecord[] = [];
  try {
    libraries = await findBucheonLibraries(isbn13, authKey, fetcher);
  } catch {
    libraries = [];
  }

  const holdings = await Promise.all(
    libraries.map(async (library): Promise<BookHolding> => {
      const libraryId = textValue(library.libCode || library.lib_code);
      return {
        libraryId,
        libraryName: textValue(library.libName || library.lib_name) || "부천시 공공도서관",
        available: libraryId ? await checkAvailability(libraryId, isbn13, authKey, fetcher) : null,
      };
    }),
  );

  const subjects = normalizeSubjects(doc);
  return {
    id: isbn13,
    isbn13,
    title,
    author: textValue(doc.authors || doc.author) || "저자 정보 없음",
    publisher: textValue(doc.publisher) || "출판사 정보 없음",
    publishedYear: normalizeYear(doc.publication_year || doc.publicationYear),
    description: textValue(doc.description || doc.bookDescription) || "도서관 정보나루에서 제공한 도서 검색 결과입니다.",
    subjects: subjects.length > 0 ? subjects : ["도서"],
    keywords: normalizeSearchKeyword(query).split(/\s+/).filter(Boolean),
    holdings,
    detailUrl: textValue(doc.bookDtlUrl || doc.bookDtlURL),
  };
}

export async function searchData4Library(query: string, authKey: string, fetcher: Fetcher = fetch): Promise<BookSearchResponse> {
  const keyword = normalizeSearchKeyword(query);
  const response = await fetchApi(
    "srchBooks",
    { keyword, pageNo: "1", pageSize: String(RESULT_LIMIT) },
    authKey,
    fetcher,
  );
  const documents = unwrapList(response.docs, "doc").slice(0, RESULT_LIMIT);
  const books = await Promise.all(documents.map((doc) => enrichBook(doc, query, authKey, fetcher)));

  return {
    items: books.filter((book): book is BookSearchResult => book !== null),
    source: "data4library",
    queriedAt: new Date().toISOString(),
  };
}
