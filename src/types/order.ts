export type CargoType = 'documents' | 'fragile' | 'common';

export interface Order {
  id: string;
  senderName: string;
  senderPhone: string;
  senderCity: string;
  receiverName: string;
  receiverCity: string;
  cargoType: CargoType;
  weight: number;
  createdAt: string;
  status: 'In Progress' | 'Delivered';
}

export type OrderFormData = Omit<Order, 'id' | 'createdAt' | 'status'>;
