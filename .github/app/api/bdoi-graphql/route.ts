const RATE_LIMIT = 100; // requests per 5 min
const WINDOW_MS = 5 * 60 * 1000;
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = memoryStore.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }

  entry.count += 1;
  memoryStore.set(ip, entry);

  if (entry.count > RATE_LIMIT) {
    throw new Error("Rate limit exceeded");
  }
}

function checkApiKey(headers: Headers) {
  const key = headers.get("x-api-key");
  const expected = process.env.BDOI_API_KEY;
  if (!expected) return; // optional
  if (!key || key !== expected) {
    throw new Error("Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    rateLimit(ip);
    checkApiKey(request.headers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 429 });
  }

  // yoga handler
  // @ts-ignore
  return yoga.handleRequest(request);
}

export const GET = POST;
