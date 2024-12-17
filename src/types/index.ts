export interface TimeTracking {
  id: string;
  featureId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'running' | 'completed';
  notes?: string;
  corrected?: boolean;
}

export interface TimeEntry {
  id: string;
  balanceId: string;
  customerId: string;
  consultantName: string;
  serviceDate: Date;
  amount: number;
  type: 'hours' | 'credits';
  createdAt: Date;
  notes?: string;
  featureId?: string;
}

export interface Balance {
  id: string;
  balanceNumber: string;
  customerId: string;
  initialBalance: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  createdBy: string;
  expiryDate?: Date;
  notes?: string;
  type: 'hours' | 'credits';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'staff' | 'consultant';
  createdAt: Date;
  photoURL?: string;
  companyId?: string;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid';
  subscriptionId?: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  address?: string;
  phone?: string;
  location?: string;
  website?: string;
  description?: string;
  serviceTypes: string[];
  customServiceTypes?: string[];
}
export interface Message {
  id: string;
  featureId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  status: 'sent' | 'read';
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
}

export interface Feature {
  id: string;
  title: string;
  balanceId: string;
  customerId: string;
  createdBy: string;
  assignedTo?: string;
  priority: 'high' | 'medium' | 'low';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}