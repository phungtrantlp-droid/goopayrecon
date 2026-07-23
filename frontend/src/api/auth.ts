import client from './client';
import { User } from '../types';

export const loginApi = (email: string, password: string): Promise<{ user: User; token: string }> => {
  return client.post('/auth/login', { email, password });
};

export const meApi = (): Promise<{ user: User }> => {
  return client.get('/auth/me');
};

export const changePasswordApi = (oldPassword: string, newPassword: string): Promise<void> => {
  return client.post('/auth/change-password', { oldPassword, newPassword });
};
