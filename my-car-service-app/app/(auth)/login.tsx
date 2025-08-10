import { useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { signIn } from '@/lib/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onLogin() {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    await signIn(email.trim(), password);
    setSubmitting(false);
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign in</Text>
        <RNView style={styles.field}>
          <Text>Email</Text>
          <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
        </RNView>
        <RNView style={styles.field}>
          <Text>Password</Text>
          <TextInput secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
        </RNView>
        <Button title={submitting ? 'Signing in...' : 'Sign in'} onPress={onLogin} disabled={submitting} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  field: { gap: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
});