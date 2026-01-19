
export enum Category {
  LEGGINGS = 'Leggings',
  TOPS = 'Tops',
  CONJUNTOS = 'Conjuntos',
  SHORTS = 'Shorts',
  ACESSORIOS = 'Acessórios',
  CALCADOS = 'Calçados',
  ALL = 'Todos'
}

export enum LoyaltyLevel {
  NONE = 'Iniciante',
  BRONZE = 'Bronze',
  SILVER = 'Prata',
  DIAMOND = 'Diamante VIP'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  promoUntil?: string; 
  description?: string;
  image: string; 
  images?: string[]; 
  category: Category | string;
  sizes: string[];
  isUniqueSize?: boolean;
  isAvailable: boolean; 
  stockQuantity: number; 
  salesCount?: number;
  createdAt?: any;
}

export interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  message: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  isRead: boolean;
  assignedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  totalSpent?: number;
  orderCount?: number;
  activeCoupon?: Coupon | null;
  loyaltyLevel?: LoyaltyLevel;
}

export interface CustomerData extends User {
  whatsapp: string;
  registrationIp: string;
  lastActivity: any;
}
