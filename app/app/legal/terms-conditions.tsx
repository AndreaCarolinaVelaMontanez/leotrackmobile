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
    title: '1. Aceptación de los términos',
    body: 'Al crear una cuenta y usar LeoTrack, aceptas estos Términos y Condiciones y nuestra Política de Privacidad. Si no estás de acuerdo, debes abstenerte de usar la aplicación.',
  },
  {
    title: '2. Descripción del servicio',
    body: 'LeoTrack es una aplicación gratuita de seguimiento de lectura personal que permite registrar libros, analizar el progreso y visualizar recomendaciones estructuradas. El servicio se ofrece "tal cual" y "según disponibilidad", sin garantía de funcionamiento continuo o libre de errores.',
  },
  {
    title: '3. Cuenta de usuario',
    body: 'Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de todas las actividades que ocurran bajo tu cuenta.',
  },
  {
    title: '4. Uso aceptable',
    body: 'Te comprometes a usar LeoTrack únicamente para fines personales y legales. Está prohibido:\n\n• Realizar actividades ilegales\n• Intentar acceder a cuentas de otros usuarios\n• Interferir con el funcionamiento del servicio\n• Usar la aplicación con fines comerciales no autorizados\n• Utilizar herramientas automatizadas o scraping sin autorización',
  },
  {
    title: '5. Contenido del usuario',
    body: 'Los datos que ingresas en LeoTrack son de tu propiedad. Al usar la aplicación, nos otorgas una licencia no exclusiva para almacenarlos y procesarlos con el fin de brindar el servicio.',
  },
  {
    title: '6. Sistema de recomendaciones',
    body: 'LeoTrack permite a los usuarios seleccionar opciones predefinidas para recomendar libros. Estas selecciones no constituyen contenido libre ni opiniones abiertas, y se presentan de forma estructurada y agregada. No es posible identificar a usuarios individuales a partir de estas recomendaciones.',
  },
  {
    title: '7. Protección de datos',
    body: 'Recopilamos y procesamos datos personales únicamente para el funcionamiento de la aplicación. El uso del servicio implica la aceptación del tratamiento de datos conforme a nuestra Política de Privacidad.',
  },
  {
    title: '8. Propiedad intelectual',
    body: 'LeoTrack, su diseño, código y contenido son propiedad de sus desarrolladores. No se permite reproducir, modificar ni distribuir ninguna parte de la aplicación sin autorización expresa.',
  },
  {
    title: '9. Limitación de responsabilidad',
    body: 'LeoTrack no garantiza resultados específicos derivados del uso de la aplicación. Las recomendaciones mostradas no constituyen asesoría profesional. No somos responsables por decisiones tomadas por los usuarios ni por daños directos o indirectos derivados del uso de la aplicación. El uso del servicio es bajo tu propio riesgo.',
  },
  {
    title: '10. Uso de datos para mejora del servicio',
    body: 'Podemos utilizar datos de uso, comportamiento y datos técnicos con el fin de mejorar la funcionalidad, seguridad y rendimiento de la aplicación.',
  },
  {
    title: '11. Uso indebido del servicio',
    body: 'Queda prohibido el uso de herramientas automatizadas, scraping o cualquier mecanismo destinado a extraer información de la aplicación sin autorización.',
  },
  {
    title: '12. Fuerza mayor',
    body: 'LeoTrack no será responsable por interrupciones o fallos del servicio causados por factores fuera de nuestro control razonable, incluyendo fallos técnicos, problemas de red o eventos externos.',
  },
  {
    title: '13. Edad mínima',
    body: 'Al utilizar LeoTrack, confirmas que tienes al menos 13 años. Si eres menor de edad, debes contar con la supervisión de un adulto.',
  },
  {
    title: '14. Modificaciones',
    body: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de la aplicación. El uso continuado implica la aceptación de los nuevos términos.',
  },
  {
    title: '15. Suspensión de cuentas',
    body: 'Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos, sin previo aviso.',
  },
  {
    title: '16. Terminación',
    body: 'Puedes dejar de usar LeoTrack en cualquier momento.',
  },
  {
    title: '17. Ley aplicable y jurisdicción',
    body: 'Estos términos se rigen por las leyes de Perú. Cualquier disputa será resuelta en los tribunales correspondientes de Perú.',
  },
  {
    title: '18. Contacto',
    body: 'Para cualquier consulta sobre estos términos, puedes contactarnos a través del correo de soporte indicado en nuestras páginas oficiales en App Store y Google Play.',
  },
];

const SECTIONS_EN = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating an account and using LeoTrack, you agree to these Terms and Conditions and our Privacy Policy. If you do not agree, you must refrain from using the application.',
  },
  {
    title: '2. Description of service',
    body: 'LeoTrack is a free personal reading tracking application that allows users to log books, analyze progress, and view structured recommendations. The service is provided "as is" and "as available", without guarantees of continuous or error-free operation.',
  },
  {
    title: '3. User account',
    body: 'You are responsible for maintaining the confidentiality of your account and password, as well as for all activities that occur under your account.',
  },
  {
    title: '4. Acceptable use',
    body: 'You agree to use LeoTrack only for personal and lawful purposes. The following are prohibited:\n\n• Engaging in illegal activities\n• Attempting to access other users\' accounts\n• Interfering with the operation of the service\n• Using the application for unauthorized commercial purposes\n• Using automated tools or scraping without authorization',
  },
  {
    title: '5. User content',
    body: 'The data you enter into LeoTrack remains your property. By using the application, you grant us a non-exclusive license to store and process it in order to provide the service.',
  },
  {
    title: '6. Recommendation system',
    body: 'LeoTrack allows users to select predefined options to recommend books. These selections do not constitute free-form content or open opinions and are displayed in a structured and aggregated manner. Individual users cannot be identified from these recommendations.',
  },
  {
    title: '7. Data protection',
    body: 'We collect and process personal data solely for the operation of the application. Use of the service implies acceptance of data processing in accordance with our Privacy Policy.',
  },
  {
    title: '8. Intellectual property',
    body: 'LeoTrack, including its design, code, and content, is the property of its developers. Reproduction, modification, or distribution of any part of the application without express authorization is prohibited.',
  },
  {
    title: '9. Limitation of liability',
    body: 'LeoTrack does not guarantee specific results from the use of the application. Recommendations do not constitute professional advice. We are not responsible for user decisions or for any direct or indirect damages arising from the use of the application. Use of the service is at your own risk.',
  },
  {
    title: '10. Use of data for service improvement',
    body: 'We may use usage, behavioral, and technical data to improve the functionality, security, and performance of the application.',
  },
  {
    title: '11. Misuse of the service',
    body: 'The use of automated tools, scraping, or any mechanism intended to extract data from the application without authorization is strictly prohibited.',
  },
  {
    title: '12. Force majeure',
    body: 'LeoTrack shall not be liable for service interruptions or failures caused by factors beyond our reasonable control, including technical failures, network issues, or external events.',
  },
  {
    title: '13. Minimum age',
    body: 'By using LeoTrack, you confirm that you are at least 13 years old. If you are a minor, you must use the application under adult supervision.',
  },
  {
    title: '14. Modifications',
    body: 'We reserve the right to modify these terms at any time. Changes will be notified through the application. Continued use implies acceptance of the updated terms.',
  },
  {
    title: '15. Account suspension',
    body: 'We reserve the right to suspend or terminate accounts that violate these terms, without prior notice.',
  },
  {
    title: '16. Termination',
    body: 'You may stop using LeoTrack at any time.',
  },
  {
    title: '17. Governing law and jurisdiction',
    body: 'These terms are governed by the laws of Peru. Any disputes shall be resolved in the competent courts of Peru.',
  },
  {
    title: '18. Contact',
    body: 'For any questions regarding these terms, you may contact us through the support email listed on our official App Store and Google Play pages.',
  },
];

export default function TermsConditionsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const language = useSettingsStore((s) => s.language);

  const isES = language === 'ES';
  const sections = isES ? SECTIONS_ES : SECTIONS_EN;
  const lastUpdated = isES ? LAST_UPDATED_ES : LAST_UPDATED_EN;
  const title = isES ? 'Términos y Condiciones' : 'Terms & Conditions';

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
