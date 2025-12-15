export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum ItemType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export enum ItemStatus {
  REPORTED = 'REPORTED',       // Just submitted
  UNDER_REVIEW = 'UNDER_REVIEW', // Admin is looking at it
  MATCHED = 'MATCHED',         // Linked to another item
  RESOLVED = 'RESOLVED'        // Item returned to owner
}

export enum Category {
  ELECTRONICS = 'Electronics',
  CLOTHING = 'Clothing',
  DOCUMENTS = 'Documents',
  ACCESSORIES = 'Accessories',
  KEYS = 'Keys',
  OTHER = 'Other'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: Category;
  description: string;
  location: string;
  date: string; // ISO Date string
  status: ItemStatus;
  reporterId: string;
  imageUrl?: string;
  matchedItemId?: string; // If matched, ID of the counterpart
}

export interface MatchSuggestion {
  lostItemId: string;
  foundItemId: string;
  confidence: number;
  reasoning: string;
}

// Stats interface for Admin Dashboard
export interface DashboardStats {
  totalLost: number;
  totalFound: number;
  pendingCases: number;
  resolvedCases: number;
}