// screens/AuthScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Necessário para fechar o browser após o login com Google no mobile
WebBrowser.maybeCompleteAuthSession();

// ── Constantes ────────────────────────────────────────────────────────────────
const BRAND_COLOR = '#4F46E5'; // Indigo — altera para a cor da tua marca
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/invalid-email': 'Formato de e-mail inválido.',
  'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
  'auth/wrong-password': 'Senha incorreta. Tenta novamente.',
  'auth/invalid-credential': 'Credenciais inválidas. Verifica o e-mail e a senha.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarda uns minutos e tenta de novo.',
  'auth/network-request-failed': 'Sem ligação à internet.',
  'auth/weak-password': 'A senha é demasiado fraca.',
  'auth/operation-not-allowed': 'Este método de login não está ativo.',
};

// ── Componente Principal ──────────────────────────────────────────────────────
export default function AuthScreen() {
  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Google OAuth ────────────────────────────────────────────
  // Substitui os client IDs pelos teus (Firebase Console > Autenticação > Google > Configuração da app)
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  const handleGoogleResponse = async () => {
    if (response?.type !== 'success') return;

    const idToken = response.authentication?.idToken;
    if (!idToken) {
      Alert.alert('Erro', 'Não foi possível obter o token do Google.');
      return;
    }

    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      // A navegação pós-login deve ser tratada por um listener de auth no teu root/navigator
    } catch (e) {
      Alert.alert('Erro ao entrar com Google', getFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Validação ───────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }

    if (mode !== 'forgot') {
      if (!password) {
        newErrors.password = 'A senha é obrigatória.';
      } else if (password.length < 6) {
        newErrors.password = 'Mínimo de 6 caracteres.';
      }
      if (mode === 'register' && password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submissão ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email.trim());
        Alert.alert(
          'E-mail enviado!',
          'Verifica a tua caixa de entrada e segue as instruções para redefinir a senha.',
          [{ text: 'OK', onPress: () => switchMode('login') }]
        );
      }
    } catch (e) {
      Alert.alert('Erro', getFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────
  const getFirebaseError = (code) =>
    FIREBASE_ERRORS[code] || 'Ocorreu um erro inesperado. Tenta novamente.';

  const switchMode = (newMode) => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowPassword(false);
    setMode(newMode);
  };

  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: null }));

  // ── Render ──────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header / Logo ── */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>✦</Text>
          </View>
          <Text style={styles.appName}>ADAlgés</Text>
          <Text style={styles.tagline}>
            {mode === 'login' && 'Bem-vindo de volta!'}
            {mode === 'register' && 'Cria a tua conta'}
            {mode === 'forgot' && 'Recuperar senha'}
          </Text>
        </View>

        {/* ── Tabs Login / Criar Conta ── */}
        {mode !== 'forgot' && (
          <View style={styles.tabRow}>
            {['login', 'register'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => switchMode(m)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                  {m === 'login' ? 'Entrar' : 'Criar Conta'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Formulário ── */}
        <View style={styles.form}>

          {/* Campo E-mail */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="o.teu@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              value={email}
              onChangeText={(t) => { setEmail(t); clearFieldError('email'); }}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Campo Senha (oculto no modo "forgot") */}
          {mode !== 'forgot' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  returnKeyType={mode === 'register' ? 'next' : 'done'}
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearFieldError('password'); }}
                  onSubmitEditing={mode === 'login' ? handleSubmit : undefined}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>
          )}

          {/* Campo Confirmar Senha (apenas no registo) */}
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Repete a senha"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); clearFieldError('confirmPassword'); }}
                onSubmitEditing={handleSubmit}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>
          )}

          {/* Link "Esqueci a senha" */}
          {mode === 'login' && (
            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => switchMode('forgot')}
              hitSlop={{ top: 8, bottom: 8 }}
            >
              <Text style={styles.forgotLinkText}>Esqueci a minha senha</Text>
            </TouchableOpacity>
          )}

          {/* Link "Voltar" (modo forgot) */}
          {mode === 'forgot' && (
            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => switchMode('login')}
              hitSlop={{ top: 8, bottom: 8 }}
            >
              <Text style={styles.forgotLinkText}>← Voltar para o login</Text>
            </TouchableOpacity>
          )}

          {/* Botão Principal */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Criar Conta'}
                {mode === 'forgot' && 'Enviar link de recuperação'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider "ou" — oculto no modo forgot */}
          {mode !== 'forgot' && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>ou</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Botão Google — oculto no modo forgot */}
          {mode !== 'forgot' && (
            <TouchableOpacity
              style={[styles.googleBtn, (!request || loading) && styles.googleBtnDisabled]}
              onPress={() => promptAsync()}
              disabled={!request || loading}
              activeOpacity={0.85}
            >
              {/* "G" estilizado — substitui por uma imagem SVG se preferires */}
              <Text style={styles.googleLetter}>G</Text>
              <Text style={styles.googleBtnText}>Continuar com Google</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer legal */}
        <Text style={styles.legalText}>
          Ao continuar, aceitas os nossos{'\n'}
          <Text style={styles.legalLink}>Termos de Uso</Text>
          {' e '}
          <Text style={styles.legalLink}>Política de Privacidade</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 30,
    color: '#fff',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '400',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: BRAND_COLOR,
  },

  // Form
  form: {},
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 2,
  },

  // Password
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 17,
  },

  // Forgot link
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 14,
    marginTop: -6,
  },
  forgotLinkText: {
    fontSize: 13,
    color: BRAND_COLOR,
    fontWeight: '600',
  },

  // Primary button
  primaryBtn: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerLabel: {
    marginHorizontal: 14,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  googleBtnDisabled: {
    opacity: 0.5,
  },
  googleLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
    marginRight: 10,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  // Legal footer
  legalText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 32,
    lineHeight: 17,
  },
  legalLink: {
    color: BRAND_COLOR,
    fontWeight: '500',
  },
});
