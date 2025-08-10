import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Vehicle } from '@/lib/types';
import { addVehicle, deleteVehicle, listVehicles, updateVehicle } from '@/lib/storage';
import { signOut } from '@/lib/auth';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const v = await listVehicles();
    setVehicles(v);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onAdd() {
    if (!name.trim()) return;
    setSubmitting(true);
    const vehicle: Vehicle = {
      id: `${Date.now()}`,
      name: name.trim(),
      make: make || undefined,
      model: model || undefined,
      year: year ? Number(year) : undefined,
      plate: plate || undefined,
    };
    await addVehicle(vehicle);
    setName('');
    setMake('');
    setModel('');
    setYear('');
    setPlate('');
    await load();
    setSubmitting(false);
  }

  async function onDelete(id: string) {
    await deleteVehicle(id);
    await load();
  }

  async function onInlineEdit(updated: Vehicle) {
    await updateVehicle(updated);
    await load();
  }

  async function onSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>My Profile</Text>
        <Button title="Sign out" onPress={onSignOut} />
      </RNView>
      <Text style={styles.sectionTitle}>Add Vehicle</Text>
      <RNView style={styles.formRow}>
        <TextInput placeholder="Name (e.g. Family Car)" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Make" value={make} onChangeText={setMake} style={styles.input} />
        <TextInput placeholder="Model" value={model} onChangeText={setModel} style={styles.input} />
        <TextInput placeholder="Year" value={year} onChangeText={setYear} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Plate" value={plate} onChangeText={setPlate} style={styles.input} />
        <Button title={submitting ? 'Adding...' : 'Add Vehicle'} onPress={onAdd} disabled={submitting} />
      </RNView>

      <Text style={styles.sectionTitle}>My Vehicles</Text>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <RNView style={styles.card}>
            <RNView style={{ gap: 6 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text>{[item.make, item.model, item.year].filter(Boolean).join(' ')}</Text>
              {item.plate ? <Text>Plate: {item.plate}</Text> : null}
            </RNView>
            <RNView style={{ gap: 6, marginTop: 8 }}>
              <Text style={styles.inlineLabel}>Quick edit</Text>
              <RNView style={styles.inlineRow}>
                <TextInput defaultValue={item.name} onEndEditing={(e) => onInlineEdit({ ...item, name: e.nativeEvent.text })} style={styles.input} />
                <TextInput defaultValue={item.make} onEndEditing={(e) => onInlineEdit({ ...item, make: e.nativeEvent.text || undefined })} style={styles.input} />
                <TextInput defaultValue={item.model} onEndEditing={(e) => onInlineEdit({ ...item, model: e.nativeEvent.text || undefined })} style={styles.input} />
                <TextInput defaultValue={item.year?.toString()} keyboardType="numeric" onEndEditing={(e) => onInlineEdit({ ...item, year: e.nativeEvent.text ? Number(e.nativeEvent.text) : undefined })} style={styles.input} />
                <TextInput defaultValue={item.plate} onEndEditing={(e) => onInlineEdit({ ...item, plate: e.nativeEvent.text || undefined })} style={styles.input} />
              </RNView>
              <Button title="Remove" color="#c0392b" onPress={() => onDelete(item.id)} />
            </RNView>
          </RNView>
        )}
        ListEmptyComponent={<RNView style={styles.empty}><Text>No vehicles yet.</Text></RNView>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  formRow: { gap: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  card: { padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', gap: 4, marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  inlineLabel: { fontSize: 12, opacity: 0.7 },
  inlineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { alignItems: 'center', marginTop: 40 },
});