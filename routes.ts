/**
 * An array of routes that are accessible to public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/"];

/** Static assets, uploads, and public marketing / browse pages */
export const publicRoutePrefixes = [
  "/System",
  "/uploads",
  "/tourism-places",
  "/auth/verify-email",
  "/auth/resend-verification",
  // تصفّح بدون تسجيل — الحجز يبقى محميّاً في الـ actions والواجهة
  "/passenger/hotels",
  "/passenger/restaurants",
  "/passenger/farms",
  "/passenger/trips",
  "/passenger/tourism-programs",
  "/passenger/tourism-places",
  "/passenger/garages",
  "/passenger/freelance-trips",
];

export function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  return publicRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * An array of routes that are accessible to private
 * These routes require authentication
 * @type {string[]}
 */

export const authRoutes = [
  "/auth/login",
  "/auth/error",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-verification",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are uesed for API authentication
 * @type {string}
 */

export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect after a successful login
 *
 * @type {string}
 */
// export const DEFAULT_LOGIN_REDIRECT_ADMIN = "/admindashboard";
export const DEFAULT_LOGIN_REDIRECT = "/home";

/** قبول callbackUrl داخلي فقط */
export function safeCallbackUrl(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_LOGIN_REDIRECT;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_LOGIN_REDIRECT;
  }
  if (value.startsWith("/auth")) return DEFAULT_LOGIN_REDIRECT;
  return value;
}

export function loginWithCallback(callbackPath: string): string {
  const safe = safeCallbackUrl(callbackPath);
  if (safe === DEFAULT_LOGIN_REDIRECT) return "/auth/login";
  return `/auth/login?callbackUrl=${encodeURIComponent(safe)}`;
}
