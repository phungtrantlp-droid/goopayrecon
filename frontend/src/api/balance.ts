import client from './client';
import { CumulativeBalance } from '../types';

export const getBalance = (params: any): Promise<CumulativeBalance[]> => {
  const { fromDate, toDate, ...rest } = params;
  return client.get('/balance', { params: { ...rest, dateFrom: fromDate, dateTo: toDate } });
};
