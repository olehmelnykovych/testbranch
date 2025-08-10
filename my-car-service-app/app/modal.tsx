import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, TextInput, Button, View as RNView, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { addService, deleteService, updateService, loadState } from '@/lib/storage';
import { ServiceRecord, ServiceType } from '@/lib/types';
import { scheduleReminder, ensureNotificationPermissions, cancelReminder } from '@/lib/notifications';
import { router, useLocalSearchParams } from 'expo-router';
import { listVehicles } from '@/lib/storage';

const SERVICE_TYPES: ServiceType[] = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Battery Check',
  'Fluid Top-up',
  'Custom',
];

export default function AddServiceModal() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id as string | undefined;

  const [vehicleName, setVehicleName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Oil Change');
  const [serviceDate, setServiceDate] = useState<string>(new Date().toISOString());
  const [odometerKm, setOdometerKm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [nextReminder, setNextReminder] = useState<string>('');
  const [notificationId, setNotificationId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);

  useEffect(() => {
    listVehicles().then((vs) => setVehicleOptions(vs.map((v) => v.name)));
  }, []);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      const state = await loadState();
      const rec = state.services.find((s) => s.id === editingId);
      if (rec) {
        setVehicleName(rec.vehicleName);
        setServiceType(rec.serviceType);
        setServiceDate(rec.serviceDateIso);
        setOdometerKm(rec.odometerKm != null ? String(rec.odometerKm) : '');
        setNotes(rec.notes ?? '');
        setNextReminder(rec.nextReminderIso ?? '');
        setNotificationId(rec.notificationId);
      }
    })();
  }, [editingId]);

  async function onSave() {
    if (!vehicleName.trim()) return;
    setSubmitting(true);
    let notifId = notificationId;
    if (nextReminder) {
      const ok = await ensureNotificationPermissions();
      if (ok) {
        notifId = await scheduleReminder(
          nextReminder,
          `${serviceType} reminder for ${vehicleName}`
        );
      }
    }

    const record: ServiceRecord = {
      id: editingId ?? `${Date.now()}`,
      vehicleName: vehicleName.trim(),
      serviceType,
      serviceDateIso: serviceDate,
      odometerKm: odometerKm ? Number(odometerKm) : undefined,
      notes: notes || undefined,
      nextReminderIso: nextReminder || undefined,
      notificationId: notifId,
    };

    if (editingId) {
      await updateService(record);
    } else {
      await addService(record);
    }
    setSubmitting(false);
    router.back();
  }

  async function onDelete() {
    if (!editingId) return;
    Alert.alert('Delete service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await cancelReminder(notificationId);
          await deleteService(editingId);
          router.back();
        }
      }
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editingId ? 'Edit Service' : 'Add Service'}</Text>
      <RNView style={styles.field}> 
        <Text>Vehicle</Text>
        <TextInput
          placeholder="e.g. Honda Civic"
          value={vehicleName}
          onChangeText={setVehicleName}
          style={styles.input}
          list="vehicleOptions"
        />
        {/* datalist for web */}
        {Platform.OS === 'web' ? (
          <datalist id="vehicleOptions">
            {vehicleOptions.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        ) : null}
      </RNView>
      <RNView style={styles.field}> 
        <Text>Service Type</Text>
        <TextInput
          placeholder="Oil Change, Tire Rotation..."
          value={serviceType}
          onChangeText={(t) => setServiceType(t as ServiceType)}
          style={styles.input}
        />
      </RNView>
      <RNView style={styles.field}> 
        <Text>Service Date (ISO)</Text>
        <TextInput
          placeholder={new Date().toISOString()}
          value={serviceDate}
          onChangeText={setServiceDate}
          style={styles.input}
          autoCapitalize="none"
        />
      </RNView>
      <RNView style={styles.field}> 
        <Text>Odometer (km)</Text>
        <TextInput
          placeholder="e.g. 45123"
          value={odometerKm}
          onChangeText={setOdometerKm}
          keyboardType="numeric"
          style={styles.input}
        />
      </RNView>
      <RNView style={styles.field}> 
        <Text>Notes</Text>
        <TextInput
          placeholder="optional notes"
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { height: 80 }]}
          multiline
        />
      </RNView>
      <RNView style={styles.field}> 
        <Text>Next Reminder (ISO date-time)</Text>
        <TextInput
          placeholder="2025-12-31T09:00:00.000Z"
          value={nextReminder}
          onChangeText={setNextReminder}
          style={styles.input}
          autoCapitalize="none"
        />
      </RNView>
      <RNView style={{ flexDirection: 'row', gap: 12 }}>
        <Button title={submitting ? 'Saving...' : 'Save Service'} onPress={onSave} disabled={submitting} />
        {editingId ? <Button title="Delete" color="#c0392b" onPress={onDelete} /> : null}
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  field: { gap: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Platform.OS === 'web' ? '#fff' : 'transparent',
  },
});
