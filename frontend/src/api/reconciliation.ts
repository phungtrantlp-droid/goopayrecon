import client from './client';
import { ReconciliationGroup } from '../types';

export const getReconciliation = (params: any): Promise<ReconciliationGroup[]> => {
  const { fromDate, toDate, ...rest } = params;
  return client.get('/reconciliation', { params: { ...rest, dateFrom: fromDate, dateTo: toDate } });
};

export const lockPeriod = (date: string, connectorCode: string): Promise<void> => {
  return client.post('/reconciliation/lock', { date, connectorCode });
};

export const unlockPeriod = (date: string, connectorCode: string, adminPassword?: string): Promise<void> => {
  return client.post('/reconciliation/unlock', { date, connectorCode, adminPassword });
};

export const updateActual = (data: { date: string; connectorCode: string; actualThuQuantity?: number; actualThuAmount?: number; actualChiQuantity?: number; actualChiAmount?: number }): Promise<ReconciliationGroup> => {
  return client.put('/reconciliation/actual', data);
};
