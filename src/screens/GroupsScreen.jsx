import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const INITIAL_GROUPS = [
  {
    id: 'jovens',
    name: 'Jovens',
    subtitle: 'Louvor, discipulado e encontros semanais',
    icon: 'people-outline',
    accent: colors.success,
  },
  {
    id: 'adolescentes',
    name: 'Adolescentes',
    subtitle: 'Crescimento em fé com linguagem da nova geração',
    icon: 'flash-outline',
    accent: colors.primary,
  },
  {
    id: 'super-igreja',
    name: 'Super Igreja (Kids/Infantil)',
    subtitle: 'Ambiente seguro e divertido para crianças',
    icon: 'happy-outline',
    accent: colors.info,
  },
];

export default function GroupsScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState({ name: '', subtitle: '' });
  const [isPublishing, setIsPublishing] = useState(false);

  const subtitle = useMemo(
    () =>
      isAdmin
        ? 'Escolhe um ministério para explorar (Modo Admin)'
        : 'Escolhe um ministério para explorar',
    [isAdmin]
  );

  const openEditModal = (group) => {
    if (!isAdmin) {
      Alert.alert('Acesso bloqueado', 'Só administradores podem editar grupos.');
      return;
    }

    setEditingGroup(group);
    setForm({ name: group.name, subtitle: group.subtitle });
  };

  const closeModal = () => {
    setEditingGroup(null);
    setForm({ name: '', subtitle: '' });
    setIsPublishing(false);
  };

  const publishChanges = async () => {
    if (!isAdmin || !editingGroup) {
      return;
    }

    const updatedName = form.name.trim();
    const updatedSubtitle = form.subtitle.trim();

    if (!updatedName || !updatedSubtitle) {
      Alert.alert('Campos obrigatórios', 'Preenche nome e descrição do grupo.');
      return;
    }

    setIsPublishing(true);

    try {
      await setDoc(
        doc(db, 'grupos', editingGroup.id),
        {
          ...editingGroup,
          name: updatedName,
          subtitle: updatedSubtitle,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === editingGroup.id
            ? { ...group, name: updatedName, subtitle: updatedSubtitle }
            : group
        )
      );

      closeModal();
      Alert.alert('Sucesso', 'Grupo atualizado com sucesso.');
    } catch {
      setIsPublishing(false);
      Alert.alert('Erro', 'Não foi possível publicar alterações do grupo.');
    }
  };

  return (
    <ScreenShell title="Grupos" subtitle={subtitle}>
      {groups.map((group) => (
        <Pressable
          key={group.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate('GrupoDetalhe', {
              groupName: group.name,
            })
          }
        >
          <View style={styles.rowStart}>
            <View style={[styles.iconWrap, { backgroundColor: `${group.accent}30` }]}>
              <Ionicons name={group.icon} size={18} color={group.accent} />
            </View>

            <View style={styles.mainTextWrap}>
              <Text style={styles.cardTitle}>{group.name}</Text>
              <Text style={styles.cardHint}>{group.subtitle}</Text>
            </View>

            <View style={styles.rightActions}>
              {isAdmin ? (
                <Pressable
                  onPress={() => openEditModal(group)}
                  style={styles.editButton}
                  hitSlop={8}
                >
                  <Ionicons name="create-outline" size={15} color={colors.textPrimary} />
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>
              ) : null}
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </View>
        </Pressable>
      ))}

      <Modal visible={Boolean(editingGroup)} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Grupo</Text>

            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
              placeholder="Nome do grupo"
              placeholderTextColor={colors.textMuted}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.subtitle}
              onChangeText={(value) => setForm((current) => ({ ...current, subtitle: value }))}
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTextWrap: {
    flex: 1,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardHint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
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
    minHeight: 96,
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
