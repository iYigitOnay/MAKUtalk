export interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  department?: string;
  class?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface Post {
  id: number;
  content: string;
  published: boolean;
  authorId: number;
  categoryId?: number;
  repostId?: number;
  repostOf?: Post;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  category?: Category;
  _count?: {
    likes: number;
    comments: number;
    reposts: number;
  };
  isLiked?: boolean; // Frontend için
  isReposted?: boolean; // Frontend için
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string[];
  timestamp: string;
  path: string;
}

export interface CreatePostData {
  content: string;
  published?: boolean;
  categoryId?: number;
}
