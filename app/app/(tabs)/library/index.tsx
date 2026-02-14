import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useLibraryList } from '../../../src/hooks/useLibrary';
import { BookCard } from '../../../src/components/BookCard';
import { FilterTabs } from '../../../src/components/FilterTabs';
import { EmptyState } from '../../../src/components/EmptyState';
import { ReadingStatus } from '../../../src/types';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_FILTERS: (ReadingStatus | undefined)[] = [
  undefined,
  'READING',
  'FINISHED',
  'WISHLIST',
];

export default function LibraryScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [filterIndex, setFilterIndex] = useState(0);

  const status = STATUS_FILTERS[filterIndex];
  const { data: books, isLoading, refetch, isRefetching } = useLibraryList(status);

  const tabs = [
    t('library.all'),
    t('library.reading'),
    t('library.finished'),
    t('library.wishlist'),
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('library.title')}
        </Text>
      </View>

      <FilterTabs tabs={tabs} activeIndex={filterIndex} onSelect={setFilterIndex} />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accentPrimary} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BookCard
              userBook={item}
              onPress={() =>
                router.push(`/(tabs)/library/${item.id}`)
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              title={t('library.emptyTitle')}
              text={t('library.emptyText')}
              actionLabel={t('library.searchBooks')}
              onAction={() => router.push('/(tabs)/search')}
            />
          }
        />
      )}
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
  list: {
    padding: 20,
    paddingTop: 0,
  },
});
