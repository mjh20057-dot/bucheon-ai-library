import assert from "node:assert/strict";
import test from "node:test";

test("searches Data4Library without exposing the authentication key", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = input instanceof URL ? input : new URL(typeof input === "string" ? input : input.url);
    assert.equal(url.searchParams.get("authKey"), "test-secret-key");

    if (url.pathname.endsWith("/srchBooks")) {
      return Response.json({
        response: {
          docs: [{ doc: { bookname: "코스모스", authors: "칼 세이건", publisher: "사이언스북스", publication_year: "2006", isbn13: "9788983711892", class_nm: "자연과학" } }],
        },
      });
    }
    if (url.pathname.endsWith("/libSrchByBook")) {
      return Response.json({ response: { libs: [{ lib: { libCode: "141001", libName: "상동도서관" } }] } });
    }
    if (url.pathname.endsWith("/bookExist")) {
      return Response.json({ response: { result: { hasBook: "Y", loanAvailable: "Y" } } });
    }
    return new Response("Not found", { status: 404 });
  };

  try {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("api-test", `${process.pid}-${Date.now()}`);
    const { default: worker } = await import(workerUrl.href);
    const response = await worker.fetch(
      new Request("http://localhost/api/library-search?q=우주"),
      { DATA4LIBRARY_AUTH_KEY: "test-secret-key" },
      { waitUntil() {}, passThroughOnException() {} },
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.source, "data4library");
    assert.equal(body.items[0].title, "코스모스");
    assert.equal(body.items[0].holdings[0].available, true);
    assert.doesNotMatch(JSON.stringify(body), /test-secret-key/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects search requests when the server secret is missing", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("missing-key-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/library-search?q=우주"),
    {},
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /authKey|DATA4LIBRARY_AUTH_KEY/);
});
