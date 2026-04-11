import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSettingsStore } from '../../src/stores/settingsStore';

const LAST_UPDATED_ES = 'Última actualización: 3 de abril de 2026';
const LAST_UPDATED_EN = 'Last updated: April 3, 2026';

const SECTIONS_ES = [
  {
    title: '1. Quiénes somos',
    body: 'LeoTrack es una aplicación móvil de seguimiento de lectura personal que permite a los usuarios registrar libros, analizar su progreso y visualizar recomendaciones basadas en selecciones estructuradas. Nos comprometemos a proteger la privacidad de nuestros usuarios y a tratar sus datos con transparencia y responsabilidad.',
  },
  {
    title: '2. Datos que recopilamos',
    body: 'Recopilamos únicamente los datos necesarios para el funcionamiento del servicio:\n\n• Nombre y correo electrónico\n• País de residencia (opcional)\n• Contraseña cifrada\n• ID de Google (si usas inicio de sesión con Google)\n• Código de verificación de correo electrónico (temporal)\n• Libros registrados en tu biblioteca\n• Sesiones de lectura (inicio, fin, duración)\n• Progreso de lectura\n• Selecciones de recomendaciones mediante opciones predefinidas\n• Preferencias de la aplicación\n• Datos técnicos (dirección IP, tipo de dispositivo, uso de la app)',
  },
  {
    title: '3. Cómo usamos tus datos',
    body: 'Usamos tus datos para:\n\n• Proporcionar acceso a tu cuenta\n• Verificar tu correo electrónico al registrarte\n• Gestionar tu biblioteca y estadísticas\n• Generar métricas agregadas de recomendaciones\n• Mejorar la funcionalidad de la aplicación\n• Garantizar la seguridad del sistema\n• Enviar comunicaciones transaccionales relacionadas con tu cuenta (verificación, recuperación de contraseña)\n\nNo vendemos tus datos ni los utilizamos con fines publicitarios externos.',
  },
  {
    title: '4. Sistema de recomendaciones',
    body: 'Las recomendaciones dentro de LeoTrack se generan mediante la selección de opciones predefinidas por parte de los usuarios. Estas recomendaciones se muestran de forma agregada y no permiten identificar a ningún usuario individual.',
  },
  {
    title: '5. Base legal del tratamiento',
    body: 'El tratamiento de tus datos se basa en:\n\n• La ejecución del servicio\n• Tu consentimiento al registrarte\n• Nuestro interés legítimo en mejorar la aplicación',
  },
  {
    title: '6. Almacenamiento y seguridad',
    body: 'Tus datos se almacenan en servidores seguros con acceso restringido. Implementamos medidas técnicas y organizativas razonables para proteger tu información, aunque ningún sistema es completamente seguro.',
  },
  {
    title: '7. Servicios de terceros',
    body: 'LeoTrack utiliza servicios externos como:\n\n• Google Sign-In — autenticación de usuario\n• Google Books API — búsqueda de libros\n• Resend (resend.com) — envío de correos transaccionales (verificación de cuenta, recuperación de contraseña)\n• Railway (railway.app) — infraestructura de servidores donde se almacenan los datos\n\nEstos servicios operan bajo sus propias políticas de privacidad y actúan como encargados del tratamiento en nombre de LeoTrack.',
  },
  {
    title: '8. Transferencia internacional de datos',
    body: 'Tus datos pueden ser almacenados o procesados en servidores ubicados fuera de tu país. Al usar LeoTrack, aceptas esta transferencia internacional de datos.',
  },
  {
    title: '9. Retención y eliminación de datos',
    body: 'Conservamos tus datos mientras tu cuenta esté activa. Puedes eliminar tu cuenta en cualquier momento desde la aplicación, lo que implicará la eliminación de tus datos asociados en un plazo razonable.',
  },
  {
    title: '10. Tus derechos',
    body: 'Tienes derecho a:\n\n• Acceder a tus datos\n• Corregir información\n• Solicitar la eliminación de tu cuenta\n• Retirar tu consentimiento\n\nPuedes ejercer estos derechos mediante la aplicación o canales de contacto.',
  },
  {
    title: '11. Menores de edad',
    body: 'LeoTrack no está dirigida a menores de 13 años y no recopila intencionalmente datos de menores.',
  },
  {
    title: '12. Limitación de responsabilidad',
    body: 'No garantizamos la seguridad absoluta de los datos ni la disponibilidad continua del servicio. Las recomendaciones mostradas no constituyen asesoría profesional. El uso de la aplicación es bajo tu propio riesgo.',
  },
  {
    title: '13. Cambios a esta política',
    body: 'Podemos actualizar esta política en cualquier momento. Notificaremos cambios relevantes dentro de la aplicación.',
  },
  {
    title: '14. Contacto',
    body: 'Para consultas relacionadas con privacidad, puedes contactarnos escribiendo a nuestro correo de soporte disponible en el perfil de la aplicación en las tiendas oficiales (App Store / Google Play).',
  },
];

const SECTIONS_EN = [
  {
    title: '1. Who we are',
    body: 'LeoTrack is a mobile application for personal reading tracking that allows users to log books, analyze progress, and view recommendations based on structured selections. We are committed to protecting user privacy and handling data responsibly.',
  },
  {
    title: '2. Data we collect',
    body: 'We collect only the data necessary to operate the service:\n\n• Name and email address\n• Country (optional)\n• Encrypted password\n• Google ID (if using Google Sign-In)\n• Email verification code (temporary)\n• Books in your library\n• Reading sessions (start, end, duration)\n• Reading progress\n• Recommendation selections via predefined options\n• App preferences\n• Technical data (IP address, device type, app usage)',
  },
  {
    title: '3. How we use your data',
    body: 'We use your data to:\n\n• Provide access to your account\n• Verify your email address upon registration\n• Manage your library and statistics\n• Generate aggregated recommendation metrics\n• Improve application functionality\n• Ensure system security\n• Send transactional communications related to your account (verification, password reset)\n\nWe do not sell your data or use it for external advertising.',
  },
  {
    title: '4. Recommendation system',
    body: 'Recommendations within LeoTrack are generated through predefined user selections. These recommendations are displayed in aggregated form and do not identify individual users.',
  },
  {
    title: '5. Legal basis for processing',
    body: 'We process your data based on:\n\n• Service execution\n• Your consent\n• Our legitimate interest in improving the application',
  },
  {
    title: '6. Storage and security',
    body: 'Your data is stored on secure servers with restricted access. We implement reasonable technical and organizational measures, although no system is completely secure.',
  },
  {
    title: '7. Third-party services',
    body: 'LeoTrack uses external services such as:\n\n• Google Sign-In — user authentication\n• Google Books API — book search\n• Resend (resend.com) — transactional email delivery (account verification, password reset)\n• Railway (railway.app) — server infrastructure where data is stored\n\nThese services operate under their own privacy policies and act as data processors on behalf of LeoTrack.',
  },
  {
    title: '8. International data transfer',
    body: 'Your data may be stored or processed on servers located outside your country. By using LeoTrack, you consent to this transfer.',
  },
  {
    title: '9. Data retention and deletion',
    body: 'We retain your data while your account is active. You may delete your account at any time from within the application.',
  },
  {
    title: '10. Your rights',
    body: 'You have the right to:\n\n• Access your data\n• Correct information\n• Request deletion\n• Withdraw consent',
  },
  {
    title: '11. Minors',
    body: 'LeoTrack is not intended for users under 13 years of age.',
  },
  {
    title: '12. Limitation of liability',
    body: 'We do not guarantee absolute data security or continuous service availability. Recommendations do not constitute professional advice. Use of the application is at your own risk.',
  },
  {
    title: '13. Changes to this policy',
    body: 'We may update this policy at any time. Significant changes will be notified within the application.',
  },
  {
    title: '14. Contact',
    body: 'For privacy-related inquiries, you can contact us through the support email listed on our official app store pages (App Store / Google Play).',
  },
];

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const language = useSettingsStore((s) => s.language);

  const isES = language === 'ES';
  const sections = isES ? SECTIONS_ES : SECTIONS_EN;
  const lastUpdated = isES ? LAST_UPDATED_ES : LAST_UPDATED_EN;
  const title = isES ? 'Política de Privacidad' : 'Privacy Policy';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>{lastUpdated}</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
              {section.body}
            </Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 11,
    marginBottom: 24,
    fontWeight: '300',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
});
