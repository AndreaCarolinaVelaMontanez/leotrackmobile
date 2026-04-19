import { useState, useEffect } from 'react';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useAuthStore } from '../../../src/stores/authStore';
import { useLibraryList, useLibraryYears } from '../../../src/hooks/useLibrary';
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

const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 10;

export default function LibraryScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [filterIndex, setFilterIndex] = useState(1);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [page, setPage] = useState(1);

  const status = STATUS_FILTERS[filterIndex];
  const yearForQuery = (status === 'READING' || status === 'WISHLIST') ? undefined : selectedYear;
  const { data, isLoading, refetch, isRefetching, isFetching } = useLibraryList(status, yearForQuery, page);
  const { data: availableYears = [] } = useLibraryYears();

  const books = data?.books ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [status, yearForQuery]);

  const tabs = [
    t('library.all'),
    t('library.reading'),
    t('library.finished'),
    t('library.wishlist'),
  ];

  const minYear = availableYears.length > 0 ? Math.min(...availableYears) : CURRENT_YEAR;
  const canGoBackYear = selectedYear > minYear;
  const canGoForwardYear = selectedYear < CURRENT_YEAR;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const rangeFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(page * PAGE_SIZE, total);

  const handleFilterChange = (index: number) => {
    setFilterIndex(index);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('library.title')}
        </Text>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>
          {t('library.greetingPrefix')}{' '}
          <Text style={[styles.greetingName, { color: theme.accentPrimary }]}>
            {user?.name}
          </Text>
        </Text>
      </View>

      {/* Year Navigator */}
      <View style={[styles.yearNav, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity
          onPress={() => setSelectedYear(selectedYear - 1)}
          disabled={!canGoBackYear}
          style={styles.yearBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={18} color={canGoBackYear ? theme.accentPrimary : theme.textTertiary} />
        </TouchableOpacity>
        <Text style={[styles.yearLabel, { color: theme.textPrimary }]}>{selectedYear}</Text>
        <TouchableOpacity
          onPress={() => setSelectedYear(selectedYear + 1)}
          disabled={!canGoForwardYear}
          style={styles.yearBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-forward" size={18} color={canGoForwardYear ? theme.accentPrimary : theme.textTertiary} />
        </TouchableOpacity>
      </View>

      <FilterTabs tabs={tabs} activeIndex={filterIndex} onSelect={handleFilterChange} />

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
              onPress={() => router.push(`/(tabs)/library/${item.id}`)}
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
          ListFooterComponent={
            <View>
              {total > PAGE_SIZE && (
                <View style={[styles.paginationWrap, { borderTopColor: theme.borderColor }]}>
                  <View style={styles.pagination}>
                    <TouchableOpacity
                      onPress={() => canPrev && setPage(page - 1)}
                      disabled={!canPrev || isFetching}
                      style={styles.pageBtn}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="chevron-back" size={22} color={canPrev ? theme.accentPrimary : theme.textTertiary} />
                    </TouchableOpacity>
                    <Text style={[styles.pageLabel, { color: theme.textPrimary }]}>
                      {t('library.pageOf', { current: page, total: totalPages })}
                    </Text>
                    <TouchableOpacity
                      onPress={() => canNext && setPage(page + 1)}
                      disabled={!canNext || isFetching}
                      style={styles.pageBtn}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="chevron-forward" size={22} color={canNext ? theme.accentPrimary : theme.textTertiary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.rangeLabel, { color: theme.textSecondary }]}>
                    {t('library.showingRange', { from: rangeFrom, to: rangeTo, total })}
                  </Text>
                </View>
              )}
              <View style={styles.brandFooter}>
                <Svg height={22} width={140}>
                  <Defs>
                    <SvgGradient id="greenGradLib" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor="#1b5e20" />
                      <Stop offset="1" stopColor="#81c784" />
                    </SvgGradient>
                  </Defs>
                  <SvgText fill="url(#greenGradLib)" fontSize="11" fontWeight="bold" x="70" y="16" textAnchor="middle" letterSpacing="1">
                    By MountLion
                  </SvgText>
                </Svg>
              </View>
            </View>
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
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  greetingName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  yearNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 20,
  },
  yearBtn: {
    padding: 6,
  },
  yearLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
    minWidth: 50,
    textAlign: 'center',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  paginationWrap: {
    paddingVertical: 14,
    borderTopWidth: 1,
    marginTop: 8,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  pageBtn: {
    padding: 8,
  },
  pageLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    minWidth: 110,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  rangeLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
