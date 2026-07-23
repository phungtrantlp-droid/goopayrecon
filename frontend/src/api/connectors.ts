import client from './client';
import { Connector } from '../types';

export const getConnectors = (params?: any): Promise<Connector[]> => {
  return client.get('/connectors', { params });
};

export const getConnector = (code: string): Promise<Connector> => {
  return client.get(`/connectors/${code}`);
};

export const createConnector = (data: Partial<Connector>): Promise<Connector> => {
  return client.post('/connectors', data);
};

export const updateConnector = (code: string, data: Partial<Connector>): Promise<Connector> => {
  return client.put(`/connectors/${code}`, data);
};

export const deleteConnector = (code: string): Promise<void> => {
  return client.delete(`/connectors/${code}`);
};

export const toggleConnectorActive = (code: string): Promise<Connector> => {
  return client.patch(`/connectors/${code}/toggle`);
};
