export type Tag = 'Action' | 'Adventure' | 'Comedy' | 'Drama' | 'Fantasy' | 'Sci-Fi' | 'Slice of Life' | 'Supernatural' | 'Thriller' | 'Romance';

export interface Anime {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: Tag[];
}

export interface User {
  id: string;
  username: string;
  password?: string; // Only used for registration/login, not stored long-term
  isAdmin: boolean;
}

export interface Rating {
  userId: string;
  animeId: string;
  score: number; // 1-10
}

export enum WatchStatus {
  None,
  WantToWatch,
  Watched,
}

export interface WatchlistItem {
  userId: string;
  animeId: string;
  status: WatchStatus;
}
