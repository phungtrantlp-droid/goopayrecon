import client from './client';
import { DashboardSummary } from '../types';

export const getDashboardSummary = (params: any): Promise<DashboardSummary> => {
  return client.get('/dashboard/summary', { params });
};

export const exportDashboard = (params: any): Promise<Blob> => {
  return client.get('/dashboard/export', { params, responseType: 'blob' }).then((res: any) => res.data);
};
