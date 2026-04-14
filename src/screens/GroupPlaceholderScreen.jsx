import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { colors } from '../theme/colors';

export default function GroupPlaceholderScreen({ route }) {
  const groupName = route.params?.groupName || 'Grupo';

  return (
    <ScreenShell title={groupName} subtitle="Espaço dedicado ao ministério">
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Esta área já está preparada</Text>
        </View>

        <Text style={styles.description}>
          Aqui podes adicionar feed do grupo, liderança, próximos encontros, pedidos de oração e materiais.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
