import { Image, StyleSheet, View } from 'react-native';

export default function ChurchLogo({ size = 44 }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#ffffff14',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
