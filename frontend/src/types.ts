export interface User {
  id: number;
  name: string;
  color: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  metrics: Metric[];
  item_count: number;
}

export interface Metric {
  id: number;
  category_id: number;
  name: string;
  metric_type: 'star' | 'boolean' | 'number' | 'range';
  min_value: number;
  max_value: number;
  label: string | null;
  options: Record<string, string> | null;  // e.g., {"1": "$", "2": "$$"}
}

export interface Item {
  id: number;
  category_id: number;
  name: string;
  external_id: string | null;
  reference: string | null;
  address: string | null;
  google_rating: string | null;
  url: string | null;
  what_i_got: string | null;
  image_url: string | null;
  reviews: Review[];
  average_scores: Record<string, number> | null;
}

export interface Review {
  id: number;
  item_id: number;
  user_id: number;
  scores: Record<string, number | boolean | { low: number; high: number }>;
  notes: string | null;
  public: boolean;
  image_url: string | null;
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  address: string | null;
  rating: string | null;
  reference: string;
  url: string | null;
}