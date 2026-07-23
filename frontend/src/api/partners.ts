import client from './client';
import { Partner, UploadResult } from '../types';

export const getPartners = (params?: any): Promise<Partner[]> => {
  return client.get('/partners', { params });
};

export const getPartner = (code: string): Promise<Partner> => {
  return client.get(`/partners/${code}`);
};

export const createPartner = (data: Partial<Partner>): Promise<Partner> => {
  return client.post('/partners', data);
};

export const updatePartner = (code: string, data: Partial<Partner>): Promise<Partner> => {
  return client.put(`/partners/${code}`, data);
};

export const deletePartner = (code: string): Promise<void> => {
  return client.delete(`/partners/${code}`);
};

export const uploadPartners = (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/partners/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadTemplate = (): Promise<Blob> => {
  return client.get('/partners/template', { responseType: 'blob' }).then((res: any) => res.data);
};
