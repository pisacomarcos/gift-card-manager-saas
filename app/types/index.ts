export type GiftCardStatus = 'ACTIVE' | 'USED' | 'EXPIRED';

export interface GiftCard {
  id: number;
  code: string;
  value: number;
  status: GiftCardStatus;
  purchaser: string;
  recipient: string;
  phoneNumber: string;
  responsible: string;
  createdAt: string;
  amountSpent: number | null;
  spentDate: string | null;
} 