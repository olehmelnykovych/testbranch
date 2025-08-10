import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { ServiceRecord } from '@/lib/types';
import { loadState } from '@/lib/storage';

export default function HistoryScreen() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const state = await loadState();
    const sorted = [...state.services].sort((a, b) =>
      new Date(a.serviceDateIso).getTime() - new Date(b.serviceDateIso).getTime()
    );
    setServices(sorted);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service History</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.serviceType} — {item.vehicleName}</Text>
            <Text>{new Date(item.serviceDateIso).toLocaleString()}</Text>
            {item.odometerKm != null && <Text>Odometer: {item.odometerKm} km</Text>}
            {item.notes ? <Text numberOfLines={3}>Notes: {item.notes}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text>No history yet.</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', gap: 4, marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 40 },
});
