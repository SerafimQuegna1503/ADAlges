import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function InfoCard({ title, date, description, location }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
      {description ? <Text style={styles.body}>{description}</Text> : null}
      {location ? <Text style={styles.location}>Local: {location}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    color: colors.navySoft,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  location: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
});
