export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export enum TransactionType {
  THU = 'THU',
  CHI = 'CHI',
  QUYET_TOAN = 'QUYET_TOAN'
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Partner {
  id: string;
  partnerCode: string;
  partnerName: string;
  serviceType: string;
  email: string;
  bankName?: string;
  bankAccount?: string;
  isActive: boolean;
  parentId?: string;
  parent?: Partner;
  children?: Partner[];
  createdAt: string;
  updatedAt: string;
}

export interface Connector {
  id: string;
  connectorCode: string;
  connectorName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  partnerCode: string;
  connectorCode: string;
  transactionType: TransactionType;
  quantity: number;
  amount: number;
  isLocked: boolean;
  partner?: Partner;
  connector?: Connector;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationGroup {
  id: string;
  date: string;
  connectorCode: string;
  systemThuQuantity: number;
  systemThuAmount: number;
  actualThuQuantity: number;
  actualThuAmount: number;
  systemChiQuantity: number;
  systemChiAmount: number;
  actualChiQuantity: number;
  actualChiAmount: number;
  isLocked: boolean;
  connector?: Connector;
  createdAt: string;
  updatedAt: string;
}

export interface CumulativeBalance {
  id: string;
  date: string;
  partnerCode: string;
  connectorCode: string;
  openingBalance: number;
  thu: number;
  chi: number;
  quyetToan: number;
  closingBalance: number;
  partner?: Partner;
  connector?: Connector;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  month: string;
  totalThu: number;
  totalChi: number;
  totalQuyetToan: number;
  netPayable: number;
  partnerSummaries: PartnerSummary[];
}

export interface PartnerSummary {
  partnerCode: string;
  partnerName: string;
  isUnlocked: boolean;
  thu: number;
  chi: number;
  quyetToan: number;
  payable: number;
}

export interface FilterState {
  fromDate?: string;
  toDate?: string;
  partnerCode?: string;
  parentPartnerCode?: string;
  connectorCode?: string;
  serviceType?: string;
  year?: number;
  month?: number;
}

export interface UploadResult {
  successCount: number;
  failedCount: number;
  failedRows: any[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
