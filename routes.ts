/**
 * An array of routes that are accessible to public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/"];

/** Static assets, uploads, and public marketing pages */
export const publicRoutePrefixes = [
  "/System",
  "/uploads",
  "/tourism-places",
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

export const authRoutes = ["/auth/login", "/auth/error","/auth/register"];

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
