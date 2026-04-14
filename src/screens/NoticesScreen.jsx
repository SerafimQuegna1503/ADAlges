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
import { notices } from '../data/notices';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function NoticesScreen() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState(notices);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [isPublishing, setIsPublishing] = useState(false);

  const subtitle = useMemo(
    () =>
      isAdmin
        ? 'Atualizações recentes da comunidade (Modo Admin)'
        : 'Atualizações recentes da comunidade',
    [isAdmin]
  );

  const openEditModal = (notice) => {
    if (!isAdmin) {
      Alert.alert('Acesso bloqueado', 'Só administradores podem editar comunicados.');
      return;
    }

    setEditingNotice(notice);
    setForm({
      title: notice.title,
      description: notice.description,
    });
  };

  const closeModal = () => {
    setEditingNotice(null);
    setForm({ title: '', description: '' });
    setIsPublishing(false);
  };

  const publishChanges = async () => {
    if (!isAdmin || !editingNotice) {
      return;
    }

    const updatedTitle = form.title.trim();
    const updatedDescription = form.description.trim();

    if (!updatedTitle || !updatedDescription) {
      Alert.alert('Campos obrigatórios', 'Preenche o título e a descrição.');
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        ...editingNotice,
        title: updatedTitle,
        description: updatedDescription,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'comunicados', editingNotice.id), payload, { merge: true });

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingNotice.id
            ? { ...item, title: updatedTitle, description: updatedDescription }
            : item
        )
      );

      closeModal();
      Alert.alert('Sucesso', 'Alterações publicadas no Firestore.');
    } catch {
      setIsPublishing(false);
      Alert.alert('Erro', 'Não foi possível publicar as alterações.');
    }
  };

  return (
    <ScreenShell title="Comunicados" subtitle={subtitle}>
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

      <Modal visible={Boolean(editingNotice)} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Comunicado</Text>

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
