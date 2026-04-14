import { SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ChurchLogo from './ChurchLogo';
import { colors } from '../theme/colors';

export default function ScreenShell({ title, subtitle, children }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 430;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={[styles.frame, width >= 960 && styles.frameWide]}>
        <View style={[styles.header, isCompact && styles.headerCompact]}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, isCompact && styles.titleCompact]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>{subtitle}</Text> : null}
          </View>
          <ChurchLogo size={isCompact ? 42 : 48} />
        </View>

        <View style={[styles.content, isCompact && styles.contentCompact]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  frame: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  frameWide: {
    maxWidth: 1100,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#1a3262',
    opacity: 0.26,
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: -110,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#15376a',
    opacity: 0.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerCompact: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  titleCompact: {
    fontSize: 28,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 2,
  },
  subtitleCompact: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentCompact: {
    paddingHorizontal: 14,
  },
});
