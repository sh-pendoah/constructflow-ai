import axios from "axios";
import { parseCookies, destroyCookie } from 'nookies'; 

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const cookies = parseCookies();
const authToken = cookies.auth_token;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || API_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

let refreshTokenRequest: any = null;

api.interceptors.request.use(
  (config) => {
    if (config.url !== "/login" && config.url !== "/auth/refresh") {
      const token = localStorage.getItem("token") || parseCookies().auth_token;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleSessionExpiration = (
  errorMessage = "Session expired. Please login again."
) => {
  setTimeout(() => {
    localStorage.clear();
    destroyCookie(null, "auth_token");
    window.location.href = "/auth";
  }, 1500);
};

api.interceptors.response.use(
  (response) => {
    // if (response?.data?.message) {
    //   toast.success(response.data.message);
    // }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error?.response?.data?.error?.message;
    if (
      (originalRequest.url === "/auth/refresh-token/") &&
      error.response?.status === 401
    ) {
      handleSessionExpiration(errorMessage);
    }

    if (error.response?.status === 401 && originalRequest.url !== "/login" && originalRequest.url !== "/signup" && originalRequest.url !== "/change-password") {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token available - logout immediately
        handleSessionExpiration(errorMessage);
        return Promise.reject(error);
      }

      // We have a refresh token - try to refresh
      try {
        if (!refreshTokenRequest) {
          refreshTokenRequest = api.post("/auth/refresh-token/", {
            refresh_token: refreshToken,
          });
        }

        const response = await refreshTokenRequest;
        const { access_token, refresh_token } = response?.data?.data;

        // Store new tokens
        if (refresh_token) {
          localStorage.setItem("token", access_token);
          localStorage.setItem("refreshToken", refresh_token);
        }

        // Update the original request header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Reset refresh token request
        refreshTokenRequest = null;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed - logout user
        handleSessionExpiration(errorMessage);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth helper functions
export const login = (email: string, password: string) => {
  return api.post('/api/auth/login', { email, password });
};

export const register = (name: string, email: string, password: string) => {
  return api.post('/api/auth/register', { name, email, password });
};

export const getProfile = (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.get('/api/auth/me', { headers });
};

export const getProjects = (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.get('/api/projects', { headers });
};

export const getHealth = () => {
  return api.get('/api/health');
};

// Password validation
export const validatePassword = (password: string): string[] => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

export default api;
