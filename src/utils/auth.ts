export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_TOKEN_EXPIRY_KEY = "authTokenExpiry";
export const AUTH_USER_DATA_KEY = "userData";
export const AUTH_USER_TYPE_KEY = "userType";

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_DATA_KEY);
  localStorage.removeItem(AUTH_USER_TYPE_KEY);
  localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
};

export const storeTokenExpiry = (expiresIn?: number | null) => {
  if (typeof expiresIn !== "number" || expiresIn <= 0) {
    localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
    return;
  }

  const expirationTimestamp = Date.now() + expiresIn * 1000;
  localStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, expirationTimestamp.toString());
};

export const getStoredTokenExpiry = (): number | null => {
  const rawExpiry = localStorage.getItem(AUTH_TOKEN_EXPIRY_KEY);
  if (!rawExpiry) {
    return null;
  }

  const expiry = Number(rawExpiry);
  return Number.isFinite(expiry) ? expiry : null;
};

export const isStoredTokenExpired = (): boolean => {
  const expiry = getStoredTokenExpiry();
  if (!expiry) {
    return false;
  }

  return Date.now() >= expiry;
};
