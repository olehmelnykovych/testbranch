import { useState } from 'react';
import { Platform, StyleSheet, TextInput, Button, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { addService } from '@/lib/storage';
import { ServiceRecord, ServiceType } from '@/lib/types';
import { scheduleReminder, ensureNotificationPermissions } from '@/lib/notifications';
import { router } from 'expo-router';

const SERVICE_TYPES: ServiceType[] = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Battery Check',
  'Fluid Top-up',
  'Custom',
];

export default function AddServiceModal() {
  const [vehicleName, setVehicleName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Oil Change');
  const [serviceDate, setServiceDate] = useState<string>(new Date().toISOString());
  const [odometerKm, setOdometerKm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [nextReminder, setNextReminder] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  async function onSave() {
    if (!vehicleName.trim()) return;
    setSubmitting(true);
    let notificationId: string | undefined;
    if (nextReminder) {
      const ok = await ensureNotificationPermissions();
      if (ok) {
        notificationId = await scheduleReminder(
          nextReminder,
          `${serviceType} reminder for ${vehicleName}`
        );
      }
    }

    const record: ServiceRecord = {
      id: `${Date.now()}`,
      vehicleName: vehicleName.trim(),
      serviceType,
      serviceDateIso: serviceDate,
      odometerKm: odometerKm ? Number(odometerKm) : undefined,
      notes: notes || undefined,
      nextReminderIso: nextReminder || undefined,
      notificationId,
    };

    await addService(record);
    setSubmitting(false);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Service</Text>
      <RNView style={styles.field}> 
        <Text>Vehicle</Text>
        <TextInput
          placeholder="e.g. Honda Civic"
          value={vehicleName}
          onChangeText={setVehicleName}
          style={styles.input}
        />
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
      <Button title={submitting ? 'Saving...' : 'Save Service'} onPress={onSave} disabled={submitting} />
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
