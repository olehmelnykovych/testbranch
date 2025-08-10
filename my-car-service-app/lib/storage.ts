import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STATE, PersistedState, ServiceRecord } from './types';

const STORAGE_KEY = 'car_service_state_v1';

export async function loadState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.services) return DEFAULT_STATE;
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