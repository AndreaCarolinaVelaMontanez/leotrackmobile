import { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
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

export default function LibraryScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [filterIndex, setFilterIndex] = useState(1);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const status = STATUS_FILTERS[filterIndex];
  const yearForQuery = (status === 'READING' || status === 'WISHLIST') ? undefined : selectedYear;
  const { data: books, isLoading, refetch, isRefetching } = useLibraryList(status, yearForQuery);
  const { data: availableYears = [] } = useLibraryYears();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const tabs = [
    t('library.all'),
    t('library.reading'),
    t('library.finished'),
    t('library.wishlist'),
  ];

  const minYear = availableYears.length > 0 ? Math.min(...availableYears) : CURRENT_YEAR;
  const canGoBack = selectedYear > minYear;
  const canGoForward = selectedYear < CURRENT_YEAR;

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
          disabled={!canGoBack}
          style={styles.yearBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={18} color={canGoBack ? theme.accentPrimary : theme.textTertiary} />
        </TouchableOpacity>
        <Text style={[styles.yearLabel, { color: theme.textPrimary }]}>{selectedYear}</Text>
        <TouchableOpacity
          onPress={() => setSelectedYear(selectedYear + 1)}
          disabled={!canGoForward}
          style={styles.yearBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-forward" size={18} color={canGoForward ? theme.accentPrimary : theme.textTertiary} />
        </TouchableOpacity>
      </View>

      <FilterTabs tabs={tabs} activeIndex={filterIndex} onSelect={handleFilterChange} />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accentPrimary} />
      ) : (
        <FlatList
          data={books ?? []}
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
          ListFooterComponent={
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
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
