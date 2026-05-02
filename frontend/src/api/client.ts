import axios from 'axios';
import type { User, Category, Metric, Item, Review, PlaceSearchResult } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories').then(r => r.data),
  create: (data: { name: string; description?: string }) => api.post<Category>('/categories', data).then(r => r.data),
  getOne: (id: number) => api.get<Category>(`/categories/${id}`).then(r => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const metricsApi = {
  getByCategory: (categoryId: number) => api.get<Metric[]>(`/metrics/category/${categoryId}`).then(r => r.data),
  create: (data: { category_id: number; name: string; metric_type?: string; min_value?: number; max_value?: number; label?: string; options?: Record<string, string> }) => api.post<Metric>('/metrics', data).then(r => r.data),
  delete: (id: number) => api.delete(`/metrics/${id}`),
};

export const itemsApi = {
  getAll: (categoryId?: number) => api.get<Item[]>('/items', { params: { category_id: categoryId } }).then(r => r.data),
  create: (data: { category_id: number; name: string; external_id?: string | null; reference?: string | null; address?: string | null; google_rating?: string | null; url?: string | null; what_i_got?: string | null; image_url?: string | null; to_try?: boolean; to_try_reason?: string | null }) => api.post<Item>('/items', data).then(r => r.data),
  getOne: (id: number) => api.get<Item>(`/items/${id}`).then(r => r.data),
  delete: (id: number) => api.delete(`/items/${id}`),
};

export const reviewsApi = {
  getAll: (itemId?: number, userId?: number) => api.get<Review[]>('/reviews', { params: { item_id: itemId, user_id: userId } }).then(r => r.data),
  create: (data: { item_id: number; user_id: number; scores: Record<string, number | boolean | { low: number; high: number }>; notes?: string; public?: boolean; image_url?: string | null }) => api.post<Review>('/reviews', data).then(r => r.data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/users').then(r => r.data),
  create: (data: { name: string; color?: string }) => api.post<User>('/users', data).then(r => r.data),
};

export const googleApi = {
  search: (query: string) => api.get<{ results: PlaceSearchResult[]; status: string }>('/google/search', { params: { query } }).then(r => r.data),
  getPlace: (placeId: string) => api.get<PlaceSearchResult>(`/google/place/${placeId}`).then(r => r.data),
  getFromUrl: (url: string) => api.post<PlaceSearchResult>('/google/from-url', { url }).then(r => r.data),
  geocode: (address: string) => api.get<{ lat: number | null; lng: number | null }>('/google/geocode', { params: { address } }).then(r => r.data),
};