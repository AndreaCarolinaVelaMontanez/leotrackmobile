import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title || !author || !pageCount) {
      Alert.alert(t('common.error'), t('common.required'));
      return;
    }

    const pages = parseInt(pageCount, 10);
    if (isNaN(pages) || pages <= 0) {
      Alert.alert(t('common.error'), t('common.invalidPageCount'));
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
      });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      router.back();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.error || t('common.failedAddBook'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('addManual.title')}
        </Text>
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
          <Input
            label={t('addManual.language')}
            placeholder={t('addManual.languagePlaceholder')}
            value={language}
            onChangeText={setLanguage}
          />

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
                onPress={() => setStatus(opt.value)}
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

          <Button
            title={t('addManual.addBook')}
            onPress={handleAdd}
            loading={loading}
            style={{ marginTop: 12 }}
          />
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
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
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
});
