export type ServiceType =
  | 'Oil Change'
  | 'Tire Rotation'
  | 'Brake Inspection'
  | 'Battery Check'
  | 'Fluid Top-up'
  | 'Custom';

export type ServiceRecord = {
  id: string;
  vehicleName: string;
  serviceType: ServiceType;
  serviceDateIso: string; // ISO date string
  odometerKm?: number;
  notes?: string;
  nextReminderIso?: string; // optional reminder date
  notificationId?: string; // expo notifications id if scheduled
};

export type PersistedState = {
  services: ServiceRecord[];
};

export const DEFAULT_STATE: PersistedState = {
  services: [],
};