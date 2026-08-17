// types/database.ts

export interface User {
  id: string; // References auth.users.id
  email: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  country: string;
  phone: string;
  created_at?: string | null;
}

export interface PricingSheet {
  id: string;
  user_id: string;
  name: string;
  target_salary: number;
  working_hours_per_month: number;
  margin_percent: number;
  cost_per_minute: number;
  suggested_price: number;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  value: number;
  created_at?: string | null;
}

export interface LaborCost {
  id: string;
  hourly_rate: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TargetProfit {
  id: string;
  profit_percent: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type OrderStatus = 'quote_sent' | 'approved' | 'in_progress' | 'delivered';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Order {
  id: string;
  user_id: string;
  customer_id: string;
  description: string;
  status: OrderStatus;
  price: number;
  estimated_hours?: number;
  due_date: string; // ISO date string
  payment_status: PaymentStatus;
  paid_at?: string | null; // ISO timestamp
  created_at?: string | null;
}

export interface OrderMaterialItem {
  id: string;
  order_id: string;
  material_cost_id: string;
  material_name_snapshot: string;
  unit_snapshot: string;
  unit_value_snapshot: number;
  quantity: number;
  line_total: number;
  created_at?: string | null;
}

export type QuoteStatus = 'pending' | 'approved';

export interface Quote {
  id: string;
  order_id: string;
  share_token: string;
  status: QuoteStatus;
  approved_at?: string | null;
}

export interface OrderRowsProps {
    customer: Customer;
    allOrders: Order;
}


// Add these color mappings here:
export const orderStatusColors: Record<OrderStatus, string> = {
    quote_sent: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    approved: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    in_progress: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    delivered: 'bg-green-500/20 text-green-700 dark:text-green-300',
};

export const paymentStatusColors: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    paid: 'bg-green-500/20 text-green-700 dark:text-green-300',
    overdue: 'bg-red-500/20 text-red-700 dark:text-red-300',
};

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  quote: string;
  avatar_url: string | null;
  locale: string;
  is_featured: boolean;
  display_order: number;
}