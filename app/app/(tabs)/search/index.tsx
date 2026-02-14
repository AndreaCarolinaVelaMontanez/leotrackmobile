import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useSearch } from '../../../src/hooks/useSearch';
import { useAddToLibrary } from '../../../src/hooks/useLibrary';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { EmptyState } from '../../../src/components/EmptyState';
import { Book } from '../../../src/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());

  const { data: results, isLoading } = useSearch(debouncedQuery);
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

  const handleAdd = async (book: Book) => {
    try {
      await addToLibrary.mutateAsync({ bookId: book.id });
      setAddedBooks((prev) => new Set(prev).add(book.id));
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.error || t('common.failedAddBook'));
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
          <View style={[styles.cover, { backgroundColor: '#667eea' }]} />
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

      <View style={styles.container}>
        <Input
          placeholder={t('search.placeholder')}
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          autoCapitalize="none"
        />

        <Button
          title={t('search.addManually')}
          onPress={() => router.push('/(tabs)/search/add-manual')}
          variant="secondary"
          style={{ marginBottom: 24 }}
        />

        {debouncedQuery.length >= 2 && (
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('search.results')}
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
              debouncedQuery.length >= 2 ? (
                <EmptyState
                  icon="search-outline"
                  title={t('search.noResults')}
                  text={t('search.noResultsText')}
                  actionLabel={t('search.addManually')}
                  onAction={() => router.push('/(tabs)/search/add-manual')}
                />
              ) : null
            }
          />
        )}
      </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
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
});
