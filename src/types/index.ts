export interface Client {
  id: string;
  publicId: string;
  businessName: string;
  ssid: string;
  wifiPassword?: string;
  backgroundColor: string;
  active: boolean;
  customTitle?: string;
  instructions?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PublicWifiData {
  publicId: string;
  businessName: string;
  ssid: string;
  wifiPassword?: string;
  backgroundColor: string;
  active: boolean;
  customTitle?: string;
  instructions?: string;
  updatedAt?: any;
}

export interface ClientFormData {
  businessName: string;
  ssid: string;
  wifiPassword?: string;
  backgroundColor: string;
  active: boolean;
  customTitle?: string;
  instructions?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: 'admin' | 'owner';
  createdAt?: string;
}

export type ToastType =
  | 'success'
  | 'error'
  | 'info'
  | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
