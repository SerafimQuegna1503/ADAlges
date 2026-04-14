import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { colors } from '../theme/colors';

const CHURCH_ADDRESS = 'Rua Calçada Rio, 43 Algés 1495-115';

export default function HomeScreen() {
  const handleOpenMap = async () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      CHURCH_ADDRESS
    )}`;

    await Linking.openURL(mapUrl);
  };

  return (
    <ScreenShell title="Início" subtitle="Bem-vindo à comunidade ADAlgés">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroBadge}>Semana em foco</Text>
          <Text style={styles.heroTitle}>Culto de Celebração</Text>
          <Text style={styles.heroText}>
            Domingo às 10:00 no Templo Principal. Traz alguém contigo e participa neste tempo especial.
          </Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.locationTitle}>Localização da Igreja</Text>
          </View>

          <Text style={styles.locationAddress}>{CHURCH_ADDRESS}</Text>

          <Pressable style={styles.mapButton} onPress={handleOpenMap}>
            <Ionicons name="map-outline" size={16} color="#ffffff" />
            <Text style={styles.mapButtonText}>Abrir no mapa</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 26,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 4,
    marginBottom: 14,
  },
  heroBadge: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  locationCard: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  locationAddress: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  mapButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mapButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
