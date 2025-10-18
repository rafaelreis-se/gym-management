import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from './api.config';

export interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Secure token storage using localStorage with encryption-like approach
 */
class SecureStorage {
  private static readonly TOKEN_KEY = 'gym_auth_token';
  private static readonly USER_KEY = 'gym_auth_user';
  private static readonly REFRESH_KEY = 'gym_refresh_token';

  static setToken(token: string): void {
    try {
      // In production, consider encrypting the token
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  static getToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      return token && token !== 'undefined' ? token : null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  static setUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  static getUser(): User | null {
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user && user !== 'undefined' ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  }

  static setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.REFRESH_KEY, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  }

  static getRefreshToken(): string | null {
    try {
      const token = localStorage.getItem(this.REFRESH_KEY);
      return token && token !== 'undefined' ? token : null;
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  static cleanupInvalidValues(): void {
    try {
      // Remove any "undefined" values that might be stored as strings
      if (localStorage.getItem(this.TOKEN_KEY) === 'undefined') {
        localStorage.removeItem(this.TOKEN_KEY);
      }
      if (localStorage.getItem(this.USER_KEY) === 'undefined') {
        localStorage.removeItem(this.USER_KEY);
      }
      if (localStorage.getItem(this.REFRESH_KEY) === 'undefined') {
        localStorage.removeItem(this.REFRESH_KEY);
      }
    } catch (error) {
      console.error('Error cleaning up storage:', error);
    }
  }

  static isTokenValid(token: string | null): boolean {
    if (!token) return false;

    try {
      // Basic JWT validation (check if it has 3 parts)
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Check if token is expired (decode payload)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Professional Authentication Service
 */
class AuthService {
  private static instance: AuthService;
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  };
  private listeners: Array<(state: AuthState) => void> = [];

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Public method to initialize authentication
   */
  initialize(): void {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from stored data
   */
  private initializeAuth(): void {
    try {
      // Clean up any invalid localStorage values first
      SecureStorage.cleanupInvalidValues();

      const token = SecureStorage.getToken();
      const user = SecureStorage.getUser();

      if (token && user && SecureStorage.isTokenValid(token)) {
        this.state = {
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        };
        this.setupInterceptors();
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.logout();
    }

    this.notifyListeners();
  }

  /**
   * Setup axios interceptors for automatic token injection
   */
  private setupInterceptors(): void {
    // Request interceptor to add token
    axios.interceptors.request.use(
      (config) => {
        const token = this.state.token;
        if (token && config.url?.includes(API_BASE_URL)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401 errors
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshed = await this.tryRefreshToken();
          if (!refreshed) {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Attempt to refresh the access token
   */
  private async tryRefreshToken(): Promise<boolean> {
    try {
      const refreshToken = SecureStorage.getRefreshToken();
      if (!refreshToken) return false;

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, user } = response.data;

      this.state = {
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      };

      SecureStorage.setToken(accessToken);
      SecureStorage.setUser(user);
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<void> {
    try {
      this.state.isLoading = true;
      this.notifyListeners();

      const response: AxiosResponse<ApiResponse<LoginResponse>> =
        await axios.post(`${API_BASE_URL}/auth/login`, credentials);

      // The API returns data wrapped in a 'data' property
      const { accessToken, refreshToken, user } = response.data.data;

      // Store tokens and user data securely
      SecureStorage.setToken(accessToken);
      SecureStorage.setRefreshToken(refreshToken);
      SecureStorage.setUser(user);

      // Update state
      this.state = {
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      };

      // Setup interceptors for future requests
      this.setupInterceptors();
      this.notifyListeners();
    } catch (error: unknown) {
      this.state.isLoading = false;
      this.notifyListeners();

      // Handle specific error cases
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (axiosError.response?.status === 403) {
        throw new Error('Account is not active');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  /**
   * Logout and clear all stored data
   */
  logout(): void {
    SecureStorage.clear();

    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };

    this.notifyListeners();
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.state.token;
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Notify all subscribers about state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.getState()));
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.state.user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    if (!this.state.user) return false;
    // If no roles are required, any authenticated user has access
    if (roles.length === 0) return true;
    return roles.includes(this.state.user.role);
  }
}

export const authService = AuthService.getInstance();
export { SecureStorage };
