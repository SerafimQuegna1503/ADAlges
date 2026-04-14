import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { colors } from '../theme/colors';

const socialItems = [
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram', handle: '@adalges' },
  { id: 'youtube', label: 'YouTube', icon: 'logo-youtube', handle: 'ADAlgés TV' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook', handle: 'Igreja ADAlgés' },
];

export default function SocialMediaScreen() {
  return (
    <ScreenShell title="Redes Sociais" subtitle="Segue a igreja nas plataformas oficiais">
      <View style={styles.list}>
        {socialItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.handle}>{item.handle}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    marginTop: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff14',
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  handle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
