import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Toast, useToast } from '../../../src/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import * as booksApi from '../../../src/api/books';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_OPTIONS = [
  { value: 'WISHLIST', labelKey: 'library.wishlistSingular' },
  { value: 'READING', labelKey: 'library.readingSingular' },
  { value: 'FINISHED', labelKey: 'library.finishedSingular' },
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i);

const LANGUAGE_OPTIONS = [
  { value: 'Spanish', labelKey: 'addManual.langSpanish' },
  { value: 'English', labelKey: 'addManual.langEnglish' },
  { value: 'Other',   labelKey: 'addManual.langOther' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'Fiction', labelKey: 'addManual.catFiction' },
  { value: 'Business & Economics', labelKey: 'addManual.catBusiness' },
  { value: 'Self-Help', labelKey: 'addManual.catSelfHelp' },
  { value: 'Computers', labelKey: 'addManual.catComputers' },
  { value: 'Science', labelKey: 'addManual.catScience' },
  { value: 'Other', labelKey: 'addManual.catOther' },
] as const;

export default function AddManualScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [language, setLanguage] = useState('');
  const [status, setStatus] = useState<string>('WISHLIST');
  const [finishedYear, setFinishedYear] = useState<number | undefined>(undefined);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const handleAdd = async () => {
    if (!title || !author || !pageCount) {
      showToast(t('common.required'), 'error');
      return;
    }

    const pages = parseInt(pageCount, 10);
    if (isNaN(pages) || pages <= 0) {
      showToast(t('common.invalidPageCount'), 'error');
      return;
    }

    setLoading(true);
    try {
      await booksApi.createManualBook({
        title: title.trim(),
        author: author.trim(),
        category: category.trim() || undefined,
        pageCount: pages,
        language: language.trim() || undefined,
        status,
        finishedYear: status === 'FINISHED' ? finishedYear : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      router.back();
    } catch {
      showToast(t('common.failedAddBook'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <Toast toast={toast} />
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('addManual.title')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label={`${t('addManual.bookTitle')} *`}
            placeholder={t('addManual.titlePlaceholder')}
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label={`${t('addManual.author')} *`}
            placeholder={t('addManual.authorPlaceholder')}
            value={author}
            onChangeText={setAuthor}
          />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('addManual.category')}
          </Text>
          <View style={styles.categoryRow}>
            {CATEGORY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor:
                      category === opt.value ? theme.accentPrimary : theme.bgTertiary,
                    borderColor:
                      category === opt.value ? theme.accentPrimary : theme.borderColor,
                  },
                ]}
                onPress={() => setCategory(opt.value)}
              >
                <Text
                  style={{
                    color: category === opt.value ? '#FFFFFF' : theme.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            label={`${t('addManual.totalPages')} *`}
            placeholder={t('addManual.pagesPlaceholder')}
            value={pageCount}
            onChangeText={setPageCount}
            keyboardType="numeric"
          />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('addManual.language')}
          </Text>
          <View style={styles.categoryRow}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: language === opt.value ? theme.accentPrimary : theme.bgTertiary,
                    borderColor: language === opt.value ? theme.accentPrimary : theme.borderColor,
                  },
                ]}
                onPress={() => setLanguage(language === opt.value ? '' : opt.value)}
              >
                <Text style={{ color: language === opt.value ? '#FFFFFF' : theme.textSecondary, fontSize: 12 }}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('addManual.status')}
          </Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor:
                      status === opt.value ? theme.accentPrimary : theme.bgTertiary,
                    borderColor:
                      status === opt.value ? theme.accentPrimary : theme.borderColor,
                  },
                ]}
                onPress={() => {
                  setStatus(opt.value);
                  if (opt.value !== 'FINISHED') setFinishedYear(undefined);
                }}
              >
                <Text
                  style={{
                    color: status === opt.value ? '#FFFFFF' : theme.textSecondary,
                    fontSize: 13,
                  }}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {status === 'FINISHED' && (
            <>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('addToLibraryModal.yearLabel')}
              </Text>
              <TouchableOpacity
                style={[styles.dropdown, { borderColor: theme.borderColor, backgroundColor: theme.bgSecondary }]}
                onPress={() => setYearPickerOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownText, { color: finishedYear ? theme.textPrimary : theme.textTertiary }]}>
                  {finishedYear ?? t('addToLibraryModal.thisYear')}
                </Text>
                <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
              </TouchableOpacity>

              <Modal visible={yearPickerOpen} transparent animationType="fade" onRequestClose={() => setYearPickerOpen(false)}>
                <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setYearPickerOpen(false)} />
                <View style={[styles.pickerSheet, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }]}>
                  <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>
                    {t('addToLibraryModal.yearLabel')}
                  </Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[styles.pickerItem, finishedYear === undefined && { backgroundColor: `${theme.accentPrimary}15` }]}
                      onPress={() => { setFinishedYear(undefined); setYearPickerOpen(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerItemText, { color: finishedYear === undefined ? theme.accentPrimary : theme.textPrimary }]}>
                        {t('addToLibraryModal.thisYear')}
                      </Text>
                      {finishedYear === undefined && <Ionicons name="checkmark" size={18} color={theme.accentPrimary} />}
                    </TouchableOpacity>
                    {YEARS.slice(1).map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[styles.pickerItem, finishedYear === year && { backgroundColor: `${theme.accentPrimary}15` }]}
                        onPress={() => { setFinishedYear(year); setYearPickerOpen(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pickerItemText, { color: finishedYear === year ? theme.accentPrimary : theme.textPrimary }]}>
                          {year}
                        </Text>
                        {finishedYear === year && <Ionicons name="checkmark" size={18} color={theme.accentPrimary} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Modal>
            </>
          )}

          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.8}
            disabled={loading}
            style={{ marginTop: 12, marginBottom: 40 }}
          >
            <LinearGradient
              colors={['#2a0040', '#490a66', '#7a2d99']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.gradientBtnText}>{t('addManual.addBook')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 24,
  },
  dropdownText: {
    fontSize: 14,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: '#00000050',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: 340,
    paddingTop: 16,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pickerScroll: {
    paddingHorizontal: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    marginHorizontal: 4,
    marginBottom: 2,
  },
  pickerItemText: {
    fontSize: 15,
  },
  gradientBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
