import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import * as authApi from '../../src/api/auth';

const BG = '#490a66';
const INPUT_BG = '#F7F4FA';
const INPUT_BORDER = '#E2DCE8';
const TEXT_DARK = '#1C1024';
const TEXT_MUTED = '#8B7A96';
const PLACEHOLDER = '#B0A0BA';
const GRADIENT: [string, string, string] = ['#2a0040', '#490a66', '#7a2d99'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async () => {
    if (!email.trim()) return;
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg(t('auth.invalidEmail'));
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setErrorMsg(t('auth.tooManyAttempts'));
      } else {
        setErrorMsg(t('common.unknownError'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#2a0040' }}>
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.brandZone}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../assets/icon2.png')}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('forgotPassword.title')}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.successTitle}>{t('forgotPassword.successTitle')}</Text>
          <Text style={styles.successText}>{t('forgotPassword.successText')}</Text>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/reset-password')}
            activeOpacity={0.85}
            style={{ marginTop: 32, marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.gradientButtonText}>{t('forgotPassword.goToReset')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryZone}>
            <Button
              title={t('forgotPassword.backToLogin')}
              onPress={() => router.back()}
              variant="text"
              textStyle={{ color: BG, fontSize: 11, fontWeight: '300', letterSpacing: 1.5, textDecorationLine: 'underline' }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#2a0040' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ZONA SUPERIOR: degradado de marca */}
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.brandZone}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../assets/icon2.png')}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('forgotPassword.title')}</Text>
        </LinearGradient>

        {/* ZONA INFERIOR: tarjeta blanca */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>{t('forgotPassword.subtitle')}</Text>

          <Input
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={(v) => { setEmail(v); setErrorMsg(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={PLACEHOLDER}
            style={{ backgroundColor: INPUT_BG, color: TEXT_DARK, borderColor: INPUT_BORDER, borderWidth: 1.5, fontWeight: '300', letterSpacing: 0.5 }}
          />

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
            style={{ marginTop: 4, marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.gradientButtonText}>{t('forgotPassword.sendInstructions')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryZone}>
            <Button
              title={t('forgotPassword.backToLogin')}
              onPress={() => router.back()}
              variant="text"
              textStyle={{ color: TEXT_MUTED, textDecorationLine: 'underline', fontSize: 11, fontWeight: '300', letterSpacing: 1.5 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  brandZone: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 18,
    borderWidth: 3.5,
    borderColor: '#C0C0C0',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  icon: {
    width: 84,
    height: 84,
    borderRadius: 17,
  },
  appName: {
    fontSize: 22,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '300',
    color: TEXT_MUTED,
    letterSpacing: 1.5,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  secondaryZone: {
    alignItems: 'center',
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F5C2C7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '300',
    color: '#842029',
    letterSpacing: 0.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '300',
    color: TEXT_DARK,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 11,
    fontWeight: '300',
    color: TEXT_MUTED,
    letterSpacing: 1,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
});
