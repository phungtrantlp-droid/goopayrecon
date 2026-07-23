import { format, parse } from 'date-fns';

export const formatDate = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    return format(new Date(isoString), 'dd/MM/yyyy');
  } catch (e) {
    return isoString;
  }
};

export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    return format(new Date(isoString), 'dd/MM/yyyy HH:mm:ss');
  } catch (e) {
    return isoString;
  }
};

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatNumber = (n?: number): string => {
  if (n === undefined || n === null) return '';
  return new Intl.NumberFormat('vi-VN').format(n);
};

export const formatPercent = (n?: number): string => {
  if (n === undefined || n === null) return '';
  return `${Number(n).toFixed(2)}%`;
};

export const parseDisplayDate = (ddmmyyyy: string): Date | null => {
  try {
    return parse(ddmmyyyy, 'dd/MM/yyyy', new Date());
  } catch (e) {
    return null;
  }
};

export const toISODate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};
