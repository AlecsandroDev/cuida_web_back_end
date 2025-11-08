export interface Medication {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
  batchNumber?: string;
  status: 'healthy' | 'normal' | 'attention' | 'urgent';
}

export interface HealthUnit {
  id: string;
  name: string;
  type: 'UBS' | 'UPA' | 'Hospital' | 'Clínica' | 'Farmácia' | 'USF' | 'Farmácia Popular' | 'UCAF';
  address: string;
  coordinates: [number, number]; // [lat, lng]
  phone: string;
  manager: string;
  status: 'healthy' | 'normal' | 'attention' | 'urgent';
  medications: Medication[];
  workingHours: string;
  services: string[];
}

export interface AlertSummary {
  attentionItems: number;
  missingItems: number;
  expiredItems: number;
  urgentActions: string[];
}