import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Pressable, Button, View as RNView, Alert } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { ServiceRecord } from '@/lib/types';
import { deleteService, loadState } from '@/lib/storage';

export default function ServicesScreen() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const state = await loadState();
    setServices(state.services);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  async function onDelete(id: string) {
    Alert.alert('Delete service', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteService(id); await load(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your Services</Text>
        <Link href="/modal" asChild>
          <Pressable>
            <Text style={styles.addAction}>+ Add</Text>
          </Pressable>
        </Link>
      </View>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.serviceType} — {item.vehicleName}</Text>
            <Text>Date: {new Date(item.serviceDateIso).toLocaleDateString()}</Text>
            {item.odometerKm != null && <Text>Odometer: {item.odometerKm} km</Text>}
            {item.nextReminderIso && <Text>Reminder: {new Date(item.nextReminderIso).toLocaleDateString()}</Text>}
            {item.notes ? <Text numberOfLines={2}>Notes: {item.notes}</Text> : null}
            <RNView style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Link href={{ pathname: '/modal', params: { id: item.id } }} asChild>
                <Pressable><Text style={styles.link}>Edit</Text></Pressable>
              </Link>
              <Pressable onPress={() => onDelete(item.id)}>
                <Text style={[styles.link, { color: '#c0392b' }]}>Delete</Text>
              </Pressable>
            </RNView>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}> 
            <Text>No services yet.</Text>
            <Text>Add your first one to track reminders.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: 'bold' },
  addAction: { fontSize: 16, color: '#0a7ea4', fontWeight: '600' },
  card: { padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  link: { color: '#0a7ea4', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 40, gap: 8 },
});
