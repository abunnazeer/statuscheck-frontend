import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1';
const SHORT_GET_CACHE_TTL_MS = 1500;
const DEFAULT_RATE_LIMIT_BACKOFF_MS = 15000;

interface CacheEntry {
  expiresAt: number;
  data: unknown;
}

class ApiClient {
  private client: AxiosInstance;
  private inflightGetRequests = new Map<string, Promise<unknown>>();
  private responseCache = new Map<string, CacheEntry>();
  private rateLimitedUntil = 0;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const method = (config.method || 'get').toLowerCase();
        if (method === 'get' && Date.now() < this.rateLimitedUntil) {
          const waitSeconds = Math.max(1, Math.ceil((this.rateLimitedUntil - Date.now()) / 1000));
          return Promise.reject(new Error(`Too many requests, retry in ${waitSeconds}s`));
        }

        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        if (error.response?.status === 429) {
          const retryAfterHeader = error.response.headers?.['retry-after'];
          const rateLimitResetHeader = error.response.headers?.['ratelimit-reset'];
          let backoffMs = DEFAULT_RATE_LIMIT_BACKOFF_MS;

          const retryAfter = Number(Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : retryAfterHeader);
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            backoffMs = retryAfter * 1000;
          } else {
            const resetSeconds = Number(Array.isArray(rateLimitResetHeader) ? rateLimitResetHeader[0] : rateLimitResetHeader);
            if (Number.isFinite(resetSeconds) && resetSeconds > 0) {
              backoffMs = resetSeconds * 1000;
            }
          }

          this.rateLimitedUntil = Math.max(this.rateLimitedUntil, Date.now() + backoffMs);
        }

        const errorMessage = error.response?.data?.message || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  private buildRequestKey(
    method: string,
    url: string,
    params?: Record<string, unknown>
  ): string {
    const normalizedParams = params
      ? JSON.stringify(
          Object.keys(params)
            .sort()
            .reduce<Record<string, unknown>>((acc, key) => {
              acc[key] = params[key];
              return acc;
            }, {})
        )
      : '';
    return `${method}:${url}:${normalizedParams}`;
  }

  private getCachedResponse<T>(key: string): T | null {
    const cached = this.responseCache.get(key);
    if (!cached) {
      return null;
    }
    if (cached.expiresAt <= Date.now()) {
      this.responseCache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  private setCachedResponse(key: string, data: unknown): void {
    this.responseCache.set(key, {
      data,
      expiresAt: Date.now() + SHORT_GET_CACHE_TTL_MS,
    });
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private handleUnauthorized(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const key = this.buildRequestKey('get', url, params);
    const cached = this.getCachedResponse<ApiResponse<T>>(key);
    if (cached) {
      return cached;
    }

    const inflight = this.inflightGetRequests.get(key) as Promise<ApiResponse<T>> | undefined;
    if (inflight) {
      return inflight;
    }

    const requestPromise = this.client
      .get<ApiResponse<T>>(url, { ...config, params })
      .then((response) => {
        this.setCachedResponse(key, response.data);
        return response.data;
      })
      .finally(() => {
        this.inflightGetRequests.delete(key);
      });

    this.inflightGetRequests.set(key, requestPromise as Promise<unknown>);
    return requestPromise;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async getPaginated<T = unknown>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    const key = this.buildRequestKey('get-paginated', url, params);
    const cached = this.getCachedResponse<PaginatedResponse<T>>(key);
    if (cached) {
      return cached;
    }

    const inflight = this.inflightGetRequests.get(key) as Promise<PaginatedResponse<T>> | undefined;
    if (inflight) {
      return inflight;
    }

    const requestPromise = this.client
      .get<PaginatedResponse<T>>(url, { params })
      .then((response) => {
        this.setCachedResponse(key, response.data);
        return response.data;
      })
      .finally(() => {
        this.inflightGetRequests.delete(key);
      });

    this.inflightGetRequests.set(key, requestPromise as Promise<unknown>);
    return requestPromise;
  }

  async getBlob(url: string, params?: Record<string, unknown>): Promise<Blob> {
    const response = await this.client.get(url, {
      params,
      responseType: 'blob',
    });

    return response.data as Blob;
  }
}

export const apiClient = new ApiClient();
