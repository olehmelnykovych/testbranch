import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STATE, PersistedState, ServiceRecord, Vehicle } from './types';

const STORAGE_KEY = 'car_service_state_v1';

export async function loadState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.services) return DEFAULT_STATE;
    // backfill vehicles if missing
    if (!('vehicles' in parsed)) {
      (parsed as any).vehicles = [];
    }
    return parsed;
  } catch (error) {
    return DEFAULT_STATE;
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function addService(record: ServiceRecord): Promise<void> {
  const state = await loadState();
  state.services.unshift(record);
  await saveState(state);
}

export async function updateService(updated: ServiceRecord): Promise<void> {
  const state = await loadState();
  state.services = state.services.map((s) => (s.id === updated.id ? updated : s));
  await saveState(state);
}

export async function deleteService(id: string): Promise<void> {
  const state = await loadState();
  state.services = state.services.filter((s) => s.id !== id);
  await saveState(state);
}

export async function listVehicles(): Promise<Vehicle[]> {
  const state = await loadState();
  return state.vehicles ?? [];
}

export async function addVehicle(vehicle: Vehicle): Promise<void> {
  const state = await loadState();
  state.vehicles.unshift(vehicle);
  await saveState(state);
}

export async function updateVehicle(updated: Vehicle): Promise<void> {
  const state = await loadState();
  state.vehicles = (state.vehicles ?? []).map((v) => (v.id === updated.id ? updated : v));
  await saveState(state);
}

export async function deleteVehicle(id: string): Promise<void> {
  const state = await loadState();
  state.vehicles = (state.vehicles ?? []).filter((v) => v.id !== id);
  await saveState(state);
}