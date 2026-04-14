import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Image, TextInput } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const INTRO_VIDEO_URL =
  'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

export default function IntroScreen({ onSubmitCode }) {
  const [pinCode, setPinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccess = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmitCode(pinCode);
    setIsSubmitting(false);

    if (!result?.ok) {
      setErrorMessage(result?.error || 'Não foi possível validar o código.');
      return;
    }

    setErrorMessage('');
    setPinCode('');
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: INTRO_VIDEO_URL }}
        style={styles.video}
        shouldPlay
        isLooping
        isMuted
        resizeMode={ResizeMode.COVER}
      />

      <View style={styles.overlay}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Bem-vindo a ADAlgés</Text>
        <Text style={styles.subtitle}>Uma comunidade para crescer em fé e comunhão</Text>

        <TextInput
          style={styles.pinInput}
          value={pinCode}
          onChangeText={(value) => {
            setPinCode(value.replace(/[^0-9]/g, ''));
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="Código de acesso"
          placeholderTextColor="#9fb0cd"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleAccess}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable style={styles.button} onPress={handleAccess}>
          <Text style={styles.buttonText}>{isSubmitting ? 'A validar...' : 'Entrar na app'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060d1f',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 13, 31, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 54,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#d8e1f2',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18,
  },
  pinInput: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderColor: 'rgba(196, 209, 233, 0.35)',
    borderWidth: 1,
    borderRadius: 14,
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  errorText: {
    width: '100%',
    color: '#ffd4d7',
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#b10b12',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
