"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BookOpenText,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockLibrarySearchService } from "@/lib/library/service";
import type { BookSearchResult } from "@/lib/library/types";

const suggestedQueries = ["우주를 쉽게 설명한 책", "마음이 따뜻해지는 소설", "돈 공부 입문서"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const visibleResults = useMemo(() => {
    if (!onlyAvailable) return results;
    return results.filter((book) => book.holdings.some((holding) => holding.available));
  }, [onlyAvailable, results]);

  async function runSearch(nextQuery: string) {
    const normalizedQuery = nextQuery.trim();
    setQuery(normalizedQuery);
    setSubmittedQuery(normalizedQuery);
    setHasSearched(true);
    setIsLoading(true);
    setError("");

    try {
      const response = await mockLibrarySearchService.search({ query: normalizedQuery });
      setResults(response.items);
    } catch {
      setResults([]);
      setError("검색 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpenText aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">부천 AI 도서관</p>
              <p className="text-xs text-muted-foreground">대화하듯 찾는 도서검색</p>
            </div>
          </div>
          <Badge className="border-amber-200 bg-amber-50 px-3 py-1 text-amber-800" variant="outline">
            시연 데이터
          </Badge>
        </div>
      </header>

      <section className="search-stage border-b border-border/70">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-px w-7 bg-primary" aria-hidden="true" />
              책 제목을 몰라도 괜찮아요
            </p>
            <h1 className="text-balance text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
              어떤 책을 찾고 계세요?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              읽고 싶은 내용이나 상황을 편하게 입력하면 관련 도서와 대출 가능한 도서관을 함께 보여드려요.
            </p>
          </div>

          <form className="mt-8 max-w-4xl" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="book-query">
              찾고 싶은 책이나 관심 주제
            </label>
            <div className="search-box flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-[0_16px_50px_-28px_rgba(15,70,90,0.45)] sm:flex-row">
              <div className="relative flex-1">
                <Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  autoComplete="off"
                  className="h-14 border-0 bg-transparent pl-12 pr-4 text-base shadow-none focus-visible:ring-0 sm:text-base"
                  id="book-query"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="예: 초등학생이 읽기 좋은 우주책 찾아줘"
                  value={query}
                />
              </div>
              <Button className="h-14 rounded-xl px-7 text-base font-bold" disabled={isLoading} size="lg" type="submit">
                {isLoading ? "찾는 중…" : "책 찾기"}
              </Button>
            </div>
          </form>

          <div className="mt-5 flex max-w-4xl flex-wrap items-center gap-2" aria-label="추천 검색어">
            <span className="mr-1 text-sm font-medium text-slate-500">이렇게 물어보세요</span>
            {suggestedQueries.map((suggestion) => (
              <Button
                className="h-8 rounded-full border-slate-200 bg-white px-3 text-slate-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                key={suggestion}
                onClick={() => void runSearch(suggestion)}
                size="sm"
                type="button"
                variant="outline"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section aria-live="polite" className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
        {!hasSearched ? (
          <InitialGuide />
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">검색 결과</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                  {submittedQuery ? `‘${submittedQuery}’에 맞는 책` : "전체 추천 도서"}
                </h2>
                {!isLoading && !error && (
                  <p className="mt-2 text-sm text-slate-500">시연 데이터에서 {visibleResults.length}권을 찾았어요.</p>
                )}
              </div>
              <Button
                aria-pressed={onlyAvailable}
                className={onlyAvailable ? "border-primary bg-primary/5 text-primary" : ""}
                onClick={() => setOnlyAvailable((current) => !current)}
                type="button"
                variant="outline"
              >
                <SlidersHorizontal aria-hidden="true" />
                대출 가능한 책만
              </Button>
            </div>

            {isLoading ? (
              <LoadingResults />
            ) : error ? (
              <StateMessage title="검색을 완료하지 못했어요" description={error} />
            ) : visibleResults.length === 0 ? (
              <StateMessage
                title="조건에 맞는 책을 찾지 못했어요"
                description="검색어를 조금 짧게 바꾸거나 다른 표현으로 다시 찾아보세요."
              />
            ) : (
              <div className="mt-6 grid gap-5">
                {visibleResults.map((book) => (
                  <BookResultCard book={book} key={book.id} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="border-t border-border bg-slate-950 px-5 py-6 text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>현재 화면의 도서와 대출 정보는 기능 검증을 위한 시연 데이터입니다.</p>
          <p className="text-slate-400">실제 정보는 Open API 연계 후 제공됩니다.</p>
        </div>
      </footer>
    </main>
  );
}

function InitialGuide() {
  const steps = [
    { icon: Search, number: "01", title: "편하게 질문하기", text: "제목 대신 읽고 싶은 내용과 상황을 입력하세요." },
    { icon: BookOpenText, number: "02", title: "관련 도서 살펴보기", text: "검색 의도와 가까운 책의 핵심 정보를 비교하세요." },
    { icon: Building2, number: "03", title: "대출 가능 여부 확인", text: "어느 도서관에서 바로 빌릴 수 있는지 확인하세요." },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map((item) => (
        <Card className="guide-card gap-4 border-slate-200 bg-white py-5 shadow-none" key={item.number}>
          <CardContent className="px-5">
            <div className="flex items-start justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary">
                <item.icon aria-hidden="true" className="size-5" />
              </div>
              <span className="font-mono text-sm font-bold text-slate-300">{item.number}</span>
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BookResultCard({ book }: { book: BookSearchResult }) {
  return (
    <article className="result-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-28px_rgba(15,23,42,0.5)]">
      <div className="grid md:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {book.subjects.map((subject) => (
              <Badge className="bg-cyan-50 text-cyan-800" key={subject} variant="secondary">
                {subject}
              </Badge>
            ))}
          </div>
          <h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">{book.title}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {book.author} · {book.publisher} · {book.publishedYear}
          </p>
          <p className="mt-5 max-w-2xl text-[0.95rem] leading-7 text-slate-600">{book.description}</p>
          <button className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline" type="button">
            책 정보 자세히 보기
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/80 p-5 md:border-l md:border-t-0 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-bold text-slate-900">소장 도서관</h4>
            <span className="text-xs font-medium text-slate-500">{book.holdings.length}곳</span>
          </div>
          <ul className="mt-4 space-y-3">
            {book.holdings.map((holding) => (
              <li className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3" key={holding.libraryId}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{holding.libraryName}</p>
                  <p className="mt-1 text-xs text-slate-500">청구기호 {holding.callNumber}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-bold ${holding.available ? "text-emerald-700" : "text-amber-700"}`}>
                  {holding.available ? <CheckCircle2 aria-hidden="true" className="size-4" /> : <Clock3 aria-hidden="true" className="size-4" />}
                  {holding.available ? "대출 가능" : "대출 중"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function LoadingResults() {
  return (
    <div className="mt-6 grid gap-5" role="status">
      <span className="sr-only">도서 검색 결과를 불러오는 중입니다.</span>
      {[1, 2].map((item) => (
        <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" key={item} />
      ))}
    </div>
  );
}

function StateMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <BookOpenText aria-hidden="true" className="mx-auto size-8 text-slate-400" />
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
