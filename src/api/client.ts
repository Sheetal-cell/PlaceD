const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

let refreshPromise: Promise<string | null> | null = null;

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  isRetry = false
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const publicEndpoints = [
    "/auth/",
    "/users/register",
    "/recruiters/register",
    "/students/add",
    "/alumni/add",
  ];

  const isPublicEndpoint = publicEndpoints.some((path) =>
    endpoint.startsWith(path)
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (!isPublicEndpoint && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (
      response.status === 401 &&
      !isRetry &&
      !isPublicEndpoint &&
      typeof window !== "undefined"
    ) {
      const refreshToken = localStorage.getItem("refreshToken");
      const storedRole = localStorage.getItem("role");

      if (refreshToken) {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const refreshResponse = await fetch(
                `${API_BASE_URL}/auth/refresh`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    refreshToken,
                    role: storedRole || undefined,
                  }),
                }
              );

              if (!refreshResponse.ok) {
                return null;
              }

              const data = await refreshResponse.json();
              if (data && data.token && data.refreshToken) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refreshToken);
                if (data.role) {
                  localStorage.setItem("role", data.role);
                }
                return data.token as string;
              }
              return null;
            } catch {
              return null;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        const newToken = await refreshPromise;

        if (newToken) {
          return request<T>(endpoint, options, true);
        }
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("auth:unauthorized"));
    } else if (
      response.status === 401 &&
      (isRetry || isPublicEndpoint) &&
      typeof window !== "undefined"
    ) {
      if (!isPublicEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }

    const errorText = await response.text();

    let errorMessage = errorText;

    try {
      const jsonErr = JSON.parse(errorText);

      if (jsonErr && typeof jsonErr === "object") {
        if (
          typeof jsonErr.message === "string" &&
          jsonErr.message
        ) {
          errorMessage = jsonErr.message;
        } else if (
          typeof jsonErr.error === "string" &&
          jsonErr.error
        ) {
          errorMessage = jsonErr.error;
        } else {
          const values = Object.entries(jsonErr)
            .map(([k, v]) => (typeof v === "string" ? `${k}: ${v}` : null))
            .filter(Boolean);
          if (values.length > 0) {
            errorMessage = values.join(", ");
          }
        }
      }
    } catch {
      // Not JSON, use errorText
    }

    throw new Error(
      errorMessage ||
        `API request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export default request;