const TOKEN_KEY = 'pdv-auth-token';

/**
 * Saves the authentication token to localStorage.
 * @param token The JWT token received from the server.
 */
export const saveToken = (token: string): void => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error("Failed to save auth token to localStorage:", error);
    }
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns The token string or null if not found.
 */
export const getToken = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error("Failed to get auth token from localStorage:", error);
        return null;
    }
};

/**
 * Removes the authentication token from localStorage.
 */
export const removeToken = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error("Failed to remove auth token from localStorage:", error);
    }
};
