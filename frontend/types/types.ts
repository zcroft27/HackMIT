export interface Credentials {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface Bottle {
  id: number;
  content: string;
  author?: string;
  tag_id: number;
  user_id: number;
  location_from: string;
  created_at: Date;
}

export interface CreateBottleRequest {
  content: string;
  author?: string;
  tag_id?: number;
  user_id?: number;
  location_from?: string;
}

export interface GetBottleRequest {
  ocean_id: number;
  seen_by_user_id: number;
}