(function () {
  const TOKEN_KEY = 'bookverse_token';
  const USER_KEY = 'bookverse_user';

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getUser = () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  };

  const setSession = ({ token, user, rememberMe }) => {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const getStoredSession = () => {
    const token = getToken() || sessionStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return { token, user: rawUser ? JSON.parse(rawUser) : null };
  };

  const request = async (url, options = {}) => {
    const session = getStoredSession();
    const headers = { ...(options.headers || {}) };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || 'Request failed';
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  window.BookVerseAPI = {
    request,
    getToken,
    getUser,
    setSession,
    clearSession,
    getStoredSession
  };
})();
