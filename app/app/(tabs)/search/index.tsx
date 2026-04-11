import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Toast, useToast } from '../../../src/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useSearch } from '../../../src/hooks/useSearch';
import { useAddToLibrary } from '../../../src/hooks/useLibrary';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { EmptyState } from '../../../src/components/EmptyState';
import { AddToLibraryModal } from '../../../src/components/AddToLibraryModal';
import { Book } from '../../../src/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());
  const [modalBook, setModalBook] = useState<Book | null>(null);
  const { toast, showToast } = useToast();

  const { data: results, isLoading, isError, error } = useSearch(debouncedQuery);
  const addToLibrary = useAddToLibrary();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setQuery('');
        setDebouncedQuery('');
        setAddedBooks(new Set());
      };
    }, [])
  );

  const handleAdd = (book: Book) => {
    setModalBook(book);
  };

  const handleModalConfirm = async (status: string, finishedYear?: number, pageCount?: number) => {
    if (!modalBook) return;
    try {
      await addToLibrary.mutateAsync({ bookId: modalBook.id, status, finishedYear, pageCount });
      setAddedBooks((prev) => new Set(prev).add(modalBook.id));
      setModalBook(null);
    } catch {
      showToast(t('common.failedAddBook'), 'error');
    }
  };

  const renderSearchResult = ({ item }: { item: Book }) => {
    const isAdded = addedBooks.has(item.id);

    return (
      <View
        style={[
          styles.resultCard,
          { backgroundColor: theme.bgPrimary, borderColor: theme.borderColor },
        ]}
      >
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: theme.bgTertiary }]} />
        )}
        <View style={styles.info}>
          <Text
            style={[styles.resultTitle, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.author, { color: theme.textSecondary }]}>
            {item.author}
          </Text>
          <Text style={[styles.meta, { color: theme.textTertiary }]}>
            {item.category || ''}{item.category && item.pageCount ? ' · ' : ''}
            {item.pageCount ? `${item.pageCount} ${t('library.pages')}` : ''}
          </Text>
          <Button
            title={isAdded ? t('search.added') : t('search.addToLibrary')}
            onPress={() => handleAdd(item)}
            disabled={isAdded}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('search.title')}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {debouncedQuery.length < 2 ? (
          <View style={styles.centeredContainer}>
            <Text style={[styles.appName, { color: theme.accentPrimary }]}>
              LeoTrack
            </Text>
            <View style={styles.searchArea}>

              <Input
                placeholder={t('search.placeholder')}
                value={query}
                onChangeText={setQuery}
                onClear={() => setQuery('')}
                autoCapitalize="none"
                searchIcon
                style={{ fontWeight: '300', letterSpacing: 2 }}
              />
              <TouchableOpacity onPress={() => router.push('/(tabs)/search/add-manual')} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#2a0040', '#490a66', '#7a2d99']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.gradientBtnText}>{t('search.addManually')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.brandFooter}>
              <Svg height={22} width={140}>
                <Defs>
                  <SvgGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#1b5e20" />
                    <Stop offset="1" stopColor="#81c784" />
                  </SvgGradient>
                </Defs>
                <SvgText
                  fill="url(#greenGrad)"
                  fontSize="11"
                  fontWeight="bold"
                  x="70"
                  y="16"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  By MountLion
                </SvgText>
              </Svg>
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.searchArea}>
              <Input
                placeholder={t('search.placeholder')}
                value={query}
                onChangeText={setQuery}
                onClear={() => setQuery('')}
                autoCapitalize="none"
                searchIcon
                style={{ fontWeight: '300', letterSpacing: 2 }}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {t('search.results')}
            </Text>

            {isError && (
              <Text style={[styles.errorText, { color: theme.textSecondary }]}>
                {t('common.error')}
              </Text>
            )}

            {isLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={theme.accentPrimary} />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderSearchResult}
                ListEmptyComponent={
                  <EmptyState
                    icon="search-outline"
                    title={t('search.noResults')}
                    text={t('search.noResultsText')}
                    actionLabel={t('search.addManually')}
                    onAction={() => router.push('/(tabs)/search/add-manual')}
                  />
                }
              />
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      <AddToLibraryModal
        visible={!!modalBook}
        book={modalBook}
        onClose={() => setModalBook(null)}
        onConfirm={handleModalConfirm}
        loading={addToLibrary.isPending}
      />
      <Toast toast={toast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 56,
    transform: [{ translateY: -90 }],
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  searchArea: {
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  cover: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
  },
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 12,
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
