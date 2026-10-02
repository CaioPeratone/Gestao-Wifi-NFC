export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA';

export interface Client {
  id: string;
  publicId: string; // Permanent Wi-Fi Public ID
  businessName: string;
  ssid: string;
  wifiPassword?: string;
  backgroundColor: string;
  active: boolean; // Wi-Fi module status
  customTitle?: string;
  instructions?: string;
  createdAt: any;
  updatedAt: any;

  // Módulo PIX (Opcional - Retrocompatível)
  pixEnabled?: boolean;
  pixPublicId?: string; // Permanent PIX Public ID (generated once enabled, never changes)
  pixKey?: string;
  pixKeyType?: PixKeyType;
  pixReceiverName?: string;
  pixCity?: string;
  pixAmount?: string;
  pixDescription?: string;
  pixBackgroundColor?: string;
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

export interface PublicPixData {
  pixPublicId: string;
  businessName: string;
  pixKey: string;
  pixKeyType: PixKeyType;
  pixReceiverName: string;
  pixCity: string;
  pixAmount?: string;
  pixDescription?: string;
  pixBackgroundColor: string;
  active: boolean;
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

  // Módulo PIX
  pixEnabled?: boolean;
  pixPublicId?: string;
  pixKey?: string;
  pixKeyType?: PixKeyType;
  pixReceiverName?: string;
  pixCity?: string;
  pixAmount?: string;
  pixDescription?: string;
  pixBackgroundColor?: string;
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
