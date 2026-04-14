import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TimelineCard from '../components/TimelineCard';
import { events } from '../data/events';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function AgendaScreen() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState(events);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    time: '',
    place: '',
  });
  const [isPublishing, setIsPublishing] = useState(false);

  const subtitle = useMemo(
    () => (isAdmin ? 'Próximos eventos da igreja (Modo Admin)' : 'Próximos eventos da igreja'),
    [isAdmin]
  );

  const openEditModal = (eventItem) => {
    if (!isAdmin) {
      Alert.alert('Acesso bloqueado', 'Só administradores podem editar eventos.');
      return;
    }

    setEditingEvent(eventItem);
    setForm({
      title: eventItem.title,
      description: eventItem.description,
      time: eventItem.time,
      place: eventItem.place,
    });
  };

  const closeModal = () => {
    setEditingEvent(null);
    setForm({ title: '', description: '', time: '', place: '' });
    setIsPublishing(false);
  };

  const publishChanges = async () => {
    if (!isAdmin || !editingEvent) {
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      time: form.time.trim(),
      place: form.place.trim(),
    };

    if (!payload.title || !payload.description || !payload.time || !payload.place) {
      Alert.alert('Campos obrigatórios', 'Preenche todos os campos do evento.');
      return;
    }

    setIsPublishing(true);

    try {
      await setDoc(
        doc(db, 'agenda', editingEvent.id),
        {
          ...editingEvent,
          ...payload,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingEvent.id
            ? {
                ...item,
                ...payload,
              }
            : item
        )
      );

      closeModal();
      Alert.alert('Sucesso', 'Evento atualizado com sucesso.');
    } catch {
      setIsPublishing(false);
      Alert.alert('Erro', 'Não foi possível publicar as alterações na agenda.');
    }
  };

  return (
    <ScreenShell title="Agenda" subtitle={subtitle}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TimelineCard
            day={item.day}
            month={item.month}
            tag={item.tag}
            title={item.title}
            description={item.description}
            time={item.time}
            place={item.place}
            accent={item.accent}
            canEdit={isAdmin}
            onEdit={() => openEditModal(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={Boolean(editingEvent)} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Evento</Text>

            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => setForm((current) => ({ ...current, title: value }))}
              placeholder="Título"
              placeholderTextColor={colors.textMuted}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
              placeholder="Descrição"
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={form.time}
                onChangeText={(value) => setForm((current) => ({ ...current, time: value }))}
                placeholder="Hora"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={form.place}
                onChangeText={(value) => setForm((current) => ({ ...current, place: value }))}
                placeholder="Local"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.publishButton, isPublishing && styles.disabledButton]}
                onPress={publishChanges}
                disabled={isPublishing}
              >
                <Text style={styles.publishButtonText}>
                  {isPublishing ? 'A publicar...' : 'Publicar Alterações'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 30,
    paddingTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 22, 0.72)',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    color: colors.textPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 100,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  publishButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
