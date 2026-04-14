import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import TimelineCard from '../components/TimelineCard';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { db } from '../../firebaseConfig';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

let DateTimePicker = null;
if (Platform.OS !== 'web') {
  try { DateTimePicker = require('@react-native-community/datetimepicker').default; } catch {}
}

const MONTHS_PT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const CATEGORIES = ['Geral', 'Jovens', 'Adolescentes', 'Super Igreja'];
const CATEGORY_ACCENTS = { Geral: '#6C63FF', Jovens: '#12C48B', Adolescentes: '#3F83FF', 'Super Igreja': '#FF9F43' };
const EMPTY_FORM = { title: '', description: '', category: 'Geral', day: '', month: '', time: '', place: '', pickerDate: new Date() };

export default function AgendaScreen() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'agenda'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setItems(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const subtitle = useMemo(
    () => (isAdmin ? 'Próximos eventos da igreja (Modo Admin)' : 'Próximos eventos da igreja'),
    [isAdmin]
  );

  const openCreate = () => {
    const now = new Date();
    setForm({ ...EMPTY_FORM, day: String(now.getDate()).padStart(2, '0'), month: MONTHS_PT[now.getMonth()], pickerDate: now });
    setModalMode('create');
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({ title: event.title, description: event.description, category: event.tag || 'Geral', day: event.day || '', month: event.month || '', time: event.time || '', place: event.place || '', pickerDate: new Date() });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setIsPublishing(false);
    setShowDatePicker(false);
  };

  const onDateChange = (_, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setForm((f) => ({ ...f, pickerDate: selected, day: String(selected.getDate()).padStart(2, '0'), month: MONTHS_PT[selected.getMonth()] }));
    }
  };

  const publish = async () => {
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description) {
      Alert.alert('Campos obrigatórios', 'Preenche o título e a descrição.');
      return;
    }
    setIsPublishing(true);
    try {
      const payload = {
        title, description,
        tag: form.category,
        day: form.day || String(new Date().getDate()).padStart(2, '0'),
        month: form.month || MONTHS_PT[new Date().getMonth()],
        time: form.time.trim(),
        place: form.place.trim(),
        accent: CATEGORY_ACCENTS[form.category] || '#6C63FF',
        updatedAt: new Date().toISOString(),
      };
      if (modalMode === 'create') {
        const id = `e_${Date.now()}`;
        await setDoc(doc(db, 'agenda', id), { ...payload, id, createdAt: new Date().toISOString() });
      } else {
        await setDoc(doc(db, 'agenda', editingEvent.id), { ...editingEvent, ...payload }, { merge: true });
      }
      closeModal();
    } catch {
      setIsPublishing(false);
      Alert.alert('Erro', 'Não foi possível publicar.');
    }
  };

  const deleteEvent = () => {
    Alert.alert('Eliminar evento', 'Esta ação não pode ser revertida.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteDoc(doc(db, 'agenda', editingEvent.id)); closeModal(); }
        catch { Alert.alert('Erro', 'Não foi possível eliminar.'); }
      }},
    ]);
  };

  return (
    <ScreenShell title="Agenda" subtitle={subtitle}>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TimelineCard
              day={item.day} month={item.month} tag={item.tag}
              title={item.title} description={item.description}
              time={item.time} place={item.place} accent={item.accent}
              canEdit={isAdmin} onEdit={() => openEdit(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{isAdmin ? 'Clica em + para adicionar um evento.' : 'Sem eventos programados.'}</Text>
          }
        />
      )}

      {isAdmin && (
        <Pressable style={styles.fab} onPress={openCreate}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}

      <Modal visible={Boolean(modalMode)} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{modalMode === 'create' ? 'Novo Evento' : 'Editar Evento'}</Text>

              <TextInput style={styles.input} value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Título" placeholderTextColor={colors.textMuted} />
              <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Descrição" placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />

              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <Pressable key={cat} style={[styles.catChip, form.category === cat && styles.catChipActive]} onPress={() => setForm((f) => ({ ...f, category: cat }))}>
                    <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Data</Text>
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, styles.halfInput]} value={form.day} onChangeText={(v) => setForm((f) => ({ ...f, day: v }))} placeholder="Dia" placeholderTextColor={colors.textMuted} keyboardType="numeric" maxLength={2} />
                <TextInput style={[styles.input, styles.halfInput]} value={form.month} onChangeText={(v) => setForm((f) => ({ ...f, month: v.toUpperCase() }))} placeholder="Mês (ex: JUL)" placeholderTextColor={colors.textMuted} maxLength={3} />
                {Platform.OS !== 'web' && DateTimePicker && (
                  <Pressable style={styles.calendarButton} onPress={() => setShowDatePicker((v) => !v)}>
                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  </Pressable>
                )}
              </View>
              {showDatePicker && DateTimePicker && (
                <DateTimePicker value={form.pickerDate} mode="date" display="default" onChange={onDateChange} />
              )}

              <Text style={styles.label}>Hora e Local</Text>
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, styles.halfInput]} value={form.time} onChangeText={(v) => setForm((f) => ({ ...f, time: v }))} placeholder="Hora (ex: 19:30)" placeholderTextColor={colors.textMuted} />
                <TextInput style={[styles.input, styles.halfInput]} value={form.place} onChangeText={(v) => setForm((f) => ({ ...f, place: v }))} placeholder="Local" placeholderTextColor={colors.textMuted} />
              </View>

              <View style={styles.modalButtons}>
                {modalMode === 'edit' && (
                  <Pressable style={styles.deleteButton} onPress={deleteEvent}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                )}
                <Pressable style={styles.cancelButton} onPress={closeModal}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.publishButton, isPublishing && styles.disabledButton]} onPress={publish} disabled={isPublishing}>
                  {isPublishing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.publishButtonText}>Gravar</Text>}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 90, paddingTop: 4 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 20, right: 0,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 8, 22, 0.82)', justifyContent: 'center' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  modalCard: { borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 },
  modalTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.backgroundElevated, color: colors.textPrimary,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10,
  },
  textArea: { minHeight: 90 },
  rowInputs: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  halfInput: { flex: 1, marginBottom: 0 },
  calendarButton: {
    width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.backgroundElevated, alignItems: 'center', justifyContent: 'center',
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catChip: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 6 },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4, alignItems: 'center' },
  deleteButton: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: colors.textPrimary, fontWeight: '700' },
  publishButton: { flex: 1, borderRadius: 12, backgroundColor: colors.primary, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  publishButtonText: { color: '#fff', fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
});

