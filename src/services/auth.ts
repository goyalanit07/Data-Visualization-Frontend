import Cookies from "js-cookie";

const AUTH_TOKEN_KEY = "auth_token";

/**
 * Check if the user is authenticated.
 * @returns {boolean} True if authenticated, false otherwise.
 */
export const isAuthenticated = (): boolean => {
  const token = Cookies.get(AUTH_TOKEN_KEY);
  return !!token;
};

/**
 * Store the authentication token.
 * @param token The authentication token to store.
 */
export const setAuthToken = (token: string): void => {
  Cookies.set(AUTH_TOKEN_KEY, token, { expires: 7 });
};

/**
 * Clear the authentication token.
 */
export const clearAuthToken = (): void => {
  Cookies.remove(AUTH_TOKEN_KEY);
};

/**
 * Get the current authentication token.
 * @returns {string | undefined} The stored token, or undefined if none exists.
 */
export const getAuthToken = (): string | undefined => {
  return Cookies.get(AUTH_TOKEN_KEY);
};
