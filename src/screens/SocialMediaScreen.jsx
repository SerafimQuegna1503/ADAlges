import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const SOCIAL_CONFIG = [
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram', placeholder: 'https://instagram.com/...' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook', placeholder: 'https://facebook.com/...' },
  { id: 'youtube', label: 'YouTube', icon: 'logo-youtube', placeholder: 'https://youtube.com/...' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', placeholder: 'https://wa.me/...' },
];

const DEFAULT_LINKS = {
  instagram: '',
  facebook: '',
  youtube: '',
  whatsapp: '',
};

export default function SocialMediaScreen() {
  const { isAdmin } = useAuth();
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_LINKS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'config', 'social'),
      (snap) => {
        if (snap.exists()) setLinks({ ...DEFAULT_LINKS, ...snap.data() });
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const openLink = async (url) => {
    if (!url) { Alert.alert('Link não configurado', 'O administrador ainda não definiu este link.'); return; }
    try { await Linking.openURL(url); } catch { Alert.alert('Erro', 'Não foi possível abrir o link.'); }
  };

  const openEditModal = () => {
    setDraft({ ...links });
    setEditModal(true);
  };

  const saveLinks = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'config', 'social'), { ...draft, updatedAt: new Date().toISOString() }, { merge: true });
      setEditModal(false);
    } catch { Alert.alert('Erro', 'Não foi possível guardar os links.'); }
    finally { setIsSaving(false); }
  };

  return (
    <ScreenShell title="Redes Sociais" subtitle="Segue a igreja nas plataformas oficiais">
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {SOCIAL_CONFIG.map((item) => (
              <Pressable key={item.id} style={styles.card} onPress={() => openLink(links[item.id])}>
                <View style={styles.iconWrap}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.handle} numberOfLines={1}>
                    {links[item.id] || 'Link não configurado'}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>

          {isAdmin && (
            <Pressable style={styles.manageButton} onPress={openEditModal}>
              <Ionicons name="settings-outline" size={16} color={colors.primary} />
              <Text style={styles.manageButtonText}>Gerir Links</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      <Modal visible={editModal} transparent animationType="fade" onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Gerir Links</Text>
              <Text style={styles.modalSubtitle}>Os links atualizam para todos os utilizadores instantaneamente.</Text>

              {SOCIAL_CONFIG.map((item) => (
                <View key={item.id}>
                  <Text style={styles.fieldLabel}>{item.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={draft[item.id]}
                    onChangeText={(v) => setDraft((d) => ({ ...d, [item.id]: v }))}
                    placeholder={item.placeholder}
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              ))}

              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelButton} onPress={() => setEditModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.publishButton, isSaving && styles.disabledButton]} onPress={saveLinks} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.publishButtonText}>Gravar</Text>}
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
  list: { gap: 10, marginTop: 6 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff14' },
  cardText: { flex: 1 },
  label: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  handle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  manageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingVertical: 13, backgroundColor: colors.surface },
  manageButtonText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 8, 22, 0.82)', justifyContent: 'center' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  modalCard: { borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 },
  modalTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { color: colors.textMuted, fontSize: 12, marginBottom: 14 },
  fieldLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  input: { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelButton: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: colors.textPrimary, fontWeight: '700' },
  publishButton: { flex: 1, borderRadius: 12, backgroundColor: colors.primary, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  publishButtonText: { color: '#fff', fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
});

