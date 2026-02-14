import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuthStore } from '../../src/stores/authStore';
import { useStats } from '../../src/hooks/useStats';
import { FilterTabs } from '../../src/components/FilterTabs';
import { StatCard } from '../../src/components/StatCard';
import { StatsBarChart } from '../../src/components/StatsBarChart';
import { CategoryItem } from '../../src/components/CategoryItem';
import { EmptyState } from '../../src/components/EmptyState';

const PERIODS = ['week', 'month', 'year'];

const MONTH_KEYS = [
  'stats.january', 'stats.february', 'stats.march', 'stats.april',
  'stats.may', 'stats.june', 'stats.july', 'stats.august',
  'stats.september', 'stats.october', 'stats.november', 'stats.december',
];

function getRefDate(period: string, offset: number): Date {
  const now = new Date();
  const ref = new Date(now);

  switch (period) {
    case 'week':
      ref.setDate(ref.getDate() + offset * 7);
      break;
    case 'month':
      ref.setMonth(ref.getMonth() + offset);
      break;
    case 'year':
      ref.setFullYear(ref.getFullYear() + offset);
      break;
  }

  return ref;
}

function formatWeekRange(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const fd = `${f.getUTCDate().toString().padStart(2, '0')}/${(f.getUTCMonth() + 1).toString().padStart(2, '0')}`;
  const td = `${t.getUTCDate().toString().padStart(2, '0')}/${(t.getUTCMonth() + 1).toString().padStart(2, '0')}`;
  return `${fd} - ${td}`;
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  const period = PERIODS[periodIndex];

  const refDate = useMemo(() => getRefDate(period, offset), [period, offset]);
  const refString = refDate.toISOString().slice(0, 10);

  const { data: stats, isLoading } = useStats(period, refString);

  const tabs = [t('stats.week'), t('stats.month'), t('stats.year')];

  const handlePeriodChange = (index: number) => {
    setPeriodIndex(index);
    setOffset(0);
  };

  const isCurrentPeriod = offset >= 0;

  const isOldestPeriod = useMemo(() => {
    if (!user?.createdAt) return false;
    const created = new Date(user.createdAt);
    const prev = getRefDate(period, offset - 1);
    switch (period) {
      case 'week':
        return prev < created;
      case 'month':
        return prev.getFullYear() < created.getFullYear() ||
          (prev.getFullYear() === created.getFullYear() && prev.getMonth() < created.getMonth());
      case 'year':
        return prev.getFullYear() < created.getFullYear();
      default:
        return false;
    }
  }, [user, period, offset]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'week':
        if (stats?.from && stats?.to) {
          return formatWeekRange(stats.from, stats.to);
        }
        return '';
      case 'month':
        return `${t(MONTH_KEYS[refDate.getMonth()])} ${refDate.getFullYear()}`;
      case 'year':
        return String(refDate.getFullYear());
      default:
        return '';
    }
  }, [period, refDate, stats, t]);

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    return `${h}h`;
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('stats.title')}
        </Text>
      </View>

      <FilterTabs tabs={tabs} activeIndex={periodIndex} onSelect={handlePeriodChange} />

      {/* Period Navigator */}
      <View style={styles.navigator}>
        <TouchableOpacity
          onPress={() => setOffset(offset - 1)}
          style={styles.navBtn}
          activeOpacity={0.6}
          disabled={isOldestPeriod}
        >
          <Ionicons name="chevron-back" size={20} color={isOldestPeriod ? theme.textTertiary : theme.accentPrimary} />
        </TouchableOpacity>

        <Text style={[styles.navLabel, { color: theme.textPrimary }]}>
          {periodLabel}
        </Text>

        <TouchableOpacity
          onPress={() => setOffset(offset + 1)}
          style={styles.navBtn}
          activeOpacity={0.6}
          disabled={isCurrentPeriod}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isCurrentPeriod ? theme.textTertiary : theme.accentPrimary}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accentPrimary} />
      ) : !stats || (stats.totalMinutes === 0 && stats.totalPages === 0 && stats.completedBooks === 0) ? (
        <EmptyState
          icon="bar-chart-outline"
          title={t('stats.emptyTitle')}
          text={t('stats.emptyText')}
        />
      ) : (
        <ScrollView style={styles.container}>
          {/* Stats Grid */}
          <View style={styles.grid}>
            <StatCard value={formatHours(stats.totalMinutes)} label={t('stats.hoursRead')} />
            <StatCard value={String(stats.totalPages)} label={t('stats.pagesRead')} />
            <StatCard value={String(stats.completedBooks)} label={t('stats.booksFinished')} />
            <StatCard value={String(stats.daysActive)} label={t('stats.readingDays')} />
          </View>

          {/* Chart */}
          {stats.daily.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {t('stats.readingActivity')}
              </Text>
              <StatsBarChart data={stats.daily} />
            </>
          )}

          {/* Top Categories */}
          {stats.categories.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {t('stats.topCategories')}
              </Text>
              <View style={[styles.card, { borderColor: theme.borderColor }]}>
                {stats.categories.map((cat, idx) => (
                  <CategoryItem
                    key={cat.name}
                    name={cat.name}
                    minutes={cat.minutes}
                    index={idx}
                  />
                ))}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
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
  navigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navBtn: {
    padding: 6,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  container: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
});
