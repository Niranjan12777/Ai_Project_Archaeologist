import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/repositories", "/search", "/chat", "/architecture", "/documentation", "/settings", "/profile"];

export function proxy(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
