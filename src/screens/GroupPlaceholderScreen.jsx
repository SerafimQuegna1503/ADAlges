import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { db } from '../../firebaseConfig';
import { deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function GroupPlaceholderScreen({ route }) {
  const groupName = route.params?.groupName || 'Grupo';
  const groupId = route.params?.groupId || groupName.toLowerCase().replace(/\s/g, '-');
  const { isAdmin } = useAuth();

  const [welcome, setWelcome] = useState('');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editWelcomeModal, setEditWelcomeModal] = useState(false);
  const [welcomeDraft, setWelcomeDraft] = useState('');
  const [noticeModal, setNoticeModal] = useState(null); // null | 'create' | notice object
  const [noticeDraft, setNoticeDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'grupos', groupId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setWelcome(data.welcome || '');
          setNotices(Array.isArray(data.groupNotices) ? data.groupNotices : []);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [groupId]);

  const saveWelcome = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'grupos', groupId), { welcome: welcomeDraft.trim(), updatedAt: new Date().toISOString() }, { merge: true });
      setEditWelcomeModal(false);
    } catch { Alert.alert('Erro', 'Não foi possível guardar.'); }
    finally { setIsSaving(false); }
  };

  const saveNotice = async () => {
    const text = noticeDraft.trim();
    if (!text) { Alert.alert('Campo vazio', 'Escreve o aviso.'); return; }
    setIsSaving(true);
    try {
      let updated;
      if (typeof noticeModal === 'object' && noticeModal !== null) {
        updated = notices.map((n) => (n.id === noticeModal.id ? { ...n, text } : n));
      } else {
        updated = [...notices, { id: `notice_${Date.now()}`, text }];
      }
      await setDoc(doc(db, 'grupos', groupId), { groupNotices: updated, updatedAt: new Date().toISOString() }, { merge: true });
      setNoticeModal(null);
      setNoticeDraft('');
    } catch { Alert.alert('Erro', 'Não foi possível guardar.'); }
    finally { setIsSaving(false); }
  };

  const deleteNotice = (noticeItem) => {
    Alert.alert('Eliminar aviso', 'Tens a certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        const updated = notices.filter((n) => n.id !== noticeItem.id);
        try { await setDoc(doc(db, 'grupos', groupId), { groupNotices: updated, updatedAt: new Date().toISOString() }, { merge: true }); }
        catch { Alert.alert('Erro', 'Não foi possível eliminar.'); }
      }},
    ]);
  };

  return (
    <ScreenShell title={groupName} subtitle="Espaço dedicado ao ministério">
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Boas-vindas */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.row}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={styles.cardTitle}>Boas-vindas</Text>
              </View>
              {isAdmin && (
                <Pressable style={styles.editChip} onPress={() => { setWelcomeDraft(welcome); setEditWelcomeModal(true); }}>
                  <Ionicons name="create-outline" size={14} color={colors.textPrimary} />
                  <Text style={styles.editChipText}>Editar</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.description}>
              {welcome || 'Bem-vindo ao espaço deste ministério! O texto de boas-vindas ainda não foi configurado.'}
            </Text>
          </View>

          {/* Avisos internos */}
          <View style={[styles.card, { marginTop: 12 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.row}>
                <Ionicons name="megaphone-outline" size={16} color={colors.warning} />
                <Text style={styles.cardTitle}>Avisos internos</Text>
              </View>
              {isAdmin && (
                <Pressable style={styles.editChip} onPress={() => { setNoticeDraft(''); setNoticeModal('create'); }}>
                  <Ionicons name="add" size={14} color={colors.textPrimary} />
                  <Text style={styles.editChipText}>Adicionar</Text>
                </Pressable>
              )}
            </View>
            {notices.length === 0 ? (
              <Text style={styles.emptyText}>{isAdmin ? 'Clica em Adicionar para criar um aviso.' : 'Sem avisos por agora.'}</Text>
            ) : (
              notices.map((n) => (
                <View key={n.id} style={styles.noticeRow}>
                  <Ionicons name="ellipse" size={6} color={colors.warning} style={{ marginTop: 6 }} />
                  <Text style={styles.noticeText}>{n.text}</Text>
                  {isAdmin && (
                    <View style={styles.noticeActions}>
                      <Pressable onPress={() => { setNoticeDraft(n.text); setNoticeModal(n); }} hitSlop={8}>
                        <Ionicons name="create-outline" size={15} color={colors.textMuted} />
                      </Pressable>
                      <Pressable onPress={() => deleteNotice(n)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={15} color={colors.danger} />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal boas-vindas */}
      <Modal visible={editWelcomeModal} transparent animationType="fade" onRequestClose={() => setEditWelcomeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Texto de Boas-vindas</Text>
            <TextInput style={[styles.input, styles.textArea]} value={welcomeDraft} onChangeText={setWelcomeDraft} placeholder="Escreve aqui o texto de boas-vindas..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setEditWelcomeModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.publishButton, isSaving && styles.disabledButton]} onPress={saveWelcome} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.publishButtonText}>Gravar</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal aviso */}
      <Modal visible={Boolean(noticeModal)} transparent animationType="fade" onRequestClose={() => setNoticeModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{typeof noticeModal === 'object' ? 'Editar Aviso' : 'Novo Aviso'}</Text>
            <TextInput style={[styles.input, styles.textArea]} value={noticeDraft} onChangeText={setNoticeDraft} placeholder="Texto do aviso..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => { setNoticeModal(null); setNoticeDraft(''); }}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.publishButton, isSaving && styles.disabledButton]} onPress={saveNotice} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.publishButtonText}>Gravar</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  editChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 4 },
  editChipText: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  description: { color: colors.textSecondary, fontSize: 15, lineHeight: 22 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  noticeRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 },
  noticeText: { flex: 1, color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  noticeActions: { flexDirection: 'row', gap: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 8, 22, 0.82)', justifyContent: 'center', padding: 22 },
  modalCard: { borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 },
  modalTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  input: { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  textArea: { minHeight: 120 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelButton: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: colors.textPrimary, fontWeight: '700' },
  publishButton: { flex: 1, borderRadius: 12, backgroundColor: colors.primary, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  publishButtonText: { color: '#fff', fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
});
