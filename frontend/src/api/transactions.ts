import client from './client';
import { Transaction, TransactionType, UploadResult } from '../types';

export const getTransactions = (params: any): Promise<Transaction[]> => {
  const { fromDate, toDate, ...rest } = params;
  return client.get('/transactions', { params: { ...rest, dateFrom: fromDate, dateTo: toDate } });
};

export const createTransaction = (data: Partial<Transaction>): Promise<Transaction> => {
  return client.post('/transactions', data);
};

export const updateTransaction = (id: string, data: Partial<Transaction>): Promise<Transaction> => {
  return client.put(`/transactions/${id}`, data);
};

export const deleteTransaction = (id: string): Promise<void> => {
  return client.delete(`/transactions/${id}`);
};

export const uploadTransactions = (file: File, type: TransactionType): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`/transactions/upload?type=${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadTemplate = (type: TransactionType): Promise<Blob> => {
  return client.get(`/transactions/template/${type.toLowerCase()}/download`, { responseType: 'blob' }).then((res: any) => res.data);
};
