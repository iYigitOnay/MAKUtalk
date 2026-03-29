export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  department?: string;
  class?: string;
  role: "USER" | "ADMIN" | "ACADEMIC";
  isBanned: boolean;
  isPrivate: boolean;
  isFollowing?: boolean;
  followStatus?: "FOLLOWING" | "PENDING" | "NONE";
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  published: boolean;
  authorId: string;
  categoryId?: string;
  repostId?: string;
  repostOf?: Post;
  parentId?: string; // TWITTER MANTIĞI: Yanıt verilen postun ID'si
  parent?: Post; // TWITTER MANTIĞI: Yanıt verilen ana post verisi
  isAcademic: boolean;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  documentUrl?: string;
  isProcessing?: boolean;
  processingStatus?: 'PREPARING' | 'MEDIA' | 'AI' | 'FINALIZING';
  sentiment?: string;
  sentimentScore?: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
    badges?: Array<{
      badge: Category; // Badge ve Category yapıları benzer (id, name, color, icon)
    }>;
  };
  category?: Category;
  _count?: {
    likes: number;
    comments: number;
    reposts: number;
    replies?: number; // TWITTER MANTIĞI: Yanıt sayısı
  };
  isLiked?: boolean; // Frontend için
  isReposted?: boolean; // Frontend için
  isBookmarked?: boolean; // Frontend için
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
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
  categoryId?: string;
}
