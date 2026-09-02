/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { searchData4Library } from "../lib/library/data4library";

interface Env {
  ASSETS: Fetcher;
  DATA4LIBRARY_AUTH_KEY?: string;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/library-search") {
      if (request.method !== "GET") {
        return Response.json({ error: "지원하지 않는 요청 방식입니다." }, { status: 405 });
      }

      const query = (url.searchParams.get("q") || "").trim();
      if (!query || query.length > 100) {
        return Response.json({ error: "1자 이상 100자 이하의 검색어를 입력해 주세요." }, { status: 400 });
      }
      if (!env.DATA4LIBRARY_AUTH_KEY) {
        return Response.json({ error: "정보나루 연결 설정을 확인하고 있어요. 잠시 후 다시 시도해 주세요." }, { status: 503 });
      }

      try {
        const result = await searchData4Library(query, env.DATA4LIBRARY_AUTH_KEY);
        return Response.json(result, {
          headers: { "cache-control": "private, max-age=60" },
        });
      } catch {
        return Response.json(
          { error: "정보나루에서 도서 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." },
          { status: 502 },
        );
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
