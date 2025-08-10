import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  id: string;
  name?: string;
  email: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user?: User;
};

const AUTH_STORAGE_KEY = 'auth_state_v1';

export async function loadAuth(): Promise<AuthState> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false };
    const parsed = JSON.parse(raw) as AuthState;
    if (typeof parsed.isAuthenticated !== 'boolean') return { isAuthenticated: false };
    return parsed;
  } catch {
    return { isAuthenticated: false };
  }
}

export async function saveAuth(state: AuthState): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export async function signIn(email: string, _password: string): Promise<AuthState> {
  const user: User = { id: String(Date.now()), email };
  const state: AuthState = { isAuthenticated: true, user };
  await saveAuth(state);
  return state;
}

export async function signOut(): Promise<void> {
  await saveAuth({ isAuthenticated: false });
}