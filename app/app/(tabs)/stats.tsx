import { useState, useMemo } from 'react';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useStats, useWeeklyActivity } from '../../src/hooks/useStats';
import { useLibraryYears } from '../../src/hooks/useLibrary';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { FilterTabs } from '../../src/components/FilterTabs';
import { StatCard } from '../../src/components/StatCard';
import { WeeklyActivityChart } from '../../src/components/WeeklyActivityChart';
import { WeekConsistencyTracker } from '../../src/components/WeekConsistencyTracker';
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

function formatWeekRange(from: string, to: string, language: string, days: string[]): string {
  // Slice to YYYY-MM-DD before parsing to avoid ISO timestamp ("...T00:00:00.000Z") breaking Number()
  const [fy, fm, fd2] = from.slice(0, 10).split('-').map(Number);
  const [ty, tm, td2] = to.slice(0, 10).split('-').map(Number);
  const f = new Date(fy, fm - 1, fd2);
  const t = new Date(ty, tm - 1, td2);
  const isEN = language === 'EN';
  const fd = isEN
    ? `${(f.getMonth() + 1).toString().padStart(2, '0')}/${f.getDate().toString().padStart(2, '0')}`
    : `${f.getDate().toString().padStart(2, '0')}/${(f.getMonth() + 1).toString().padStart(2, '0')}`;
  const td = isEN
    ? `${(t.getMonth() + 1).toString().padStart(2, '0')}/${t.getDate().toString().padStart(2, '0')}`
    : `${t.getDate().toString().padStart(2, '0')}/${(t.getMonth() + 1).toString().padStart(2, '0')}`;
  return `${days[f.getDay()]} ${fd} – ${days[t.getDay()]} ${td}`;
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const language = useSettingsStore((s) => s.language);
  const { data: libraryYears = [] } = useLibraryYears();
  const [periodIndex, setPeriodIndex] = useState(1);
  const [offset, setOffset] = useState(0);

  const period = PERIODS[periodIndex];
  const weekStart = language === 'EN' ? 'sunday' : 'monday';

  const refDate = useMemo(() => getRefDate(period, offset), [period, offset]);
  const refString = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}-${String(refDate.getDate()).padStart(2, '0')}`;

  const { data: stats, isLoading, refetch } = useStats(period, refString, weekStart);
  const { data: weeklyActivity = [], refetch: refetchWeekly } = useWeeklyActivity(refString);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchWeekly();
    }, [refetch, refetchWeekly])
  );

  const tabs = [t('stats.week'), t('stats.month'), t('stats.year')];

  const handlePeriodChange = (index: number) => {
    setPeriodIndex(index);
    setOffset(0);
  };

  const isCurrentPeriod = offset >= 0;

  const isOldestPeriod = useMemo(() => {
    const prev = getRefDate(period, offset - 1);
    switch (period) {
      case 'week':
      case 'month': {
        if (!user?.createdAt) return false;
        const created = new Date(user.createdAt);
        if (period === 'week') return prev < created;
        return prev.getFullYear() < created.getFullYear() ||
          (prev.getFullYear() === created.getFullYear() && prev.getMonth() < created.getMonth());
      }
      case 'year': {
        const minYear = libraryYears.length > 0
          ? Math.min(...libraryYears)
          : (user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear());
        return prev.getFullYear() < minYear;
      }
      default:
        return false;
    }
  }, [user, period, offset, libraryYears]);

  const days = t('stats.days', { returnObjects: true }) as string[];

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'week':
        if (stats?.from && stats?.to) {
          return formatWeekRange(stats.from, stats.to, language, days);
        }
        return '';
      case 'month':
        return `${t(MONTH_KEYS[refDate.getMonth()])} ${refDate.getFullYear()}`;
      case 'year':
        return String(refDate.getFullYear());
      default:
        return '';
    }
  }, [period, refDate, stats, t, language, days]);

  const monthlyAvg = useMemo(() => {
    const months = stats?.allTime?.monthsElapsed ?? 1;
    return (stats?.allTime?.finishedBooks ?? 0) / months;
  }, [stats?.allTime?.finishedBooks, stats?.allTime?.monthsElapsed]);

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.elegantTitle, { color: theme.textPrimary, marginBottom: 0 }]}>
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
      ) : !stats ? (
        <EmptyState
          icon="bar-chart-outline"
          title={t('stats.emptyTitle')}
          text={t('stats.emptyText')}
        />
      ) : (
        <ScrollView style={styles.container}>

          {/* Resumen General — datos acumulados de todos los libros */}
          {period !== 'week' && stats.allTime?.finishedBooks >= 0 && (
            <>
              <Text style={[styles.elegantTitle, { color: theme.textPrimary }]}>
                {t(period === 'month' ? 'stats.allTimeTitleMonth' : period === 'year' ? 'stats.allTimeTitleYear' : 'stats.allTimeTitle')}
              </Text>
              {/* Hero card — Libros Leídos */}
              <View style={styles.heroCardWrapper}>
                <LinearGradient
                  colors={period === 'month'
                    ? ['#4a148c', '#7b1fa2', '#ab47bc', '#ce93d8']
                    : ['#1b5e20', '#2e7d32', '#388e3c', '#81c784']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroCard}
                >
                  <Text style={styles.heroLabel}>{t(period === 'year' ? 'stats.allTimeBooks' : 'stats.allTimeBooksMonth')}</Text>
                  <Text style={styles.heroValue}>{stats.allTime.finishedBooks}</Text>
                  <View style={styles.heroSeparator} />
                  <Text style={styles.heroAvgLabel}>{t('stats.monthlyAvgLabel')}</Text>
                  <Text style={styles.heroAvgValue}>{monthlyAvg.toFixed(1)} {t('stats.monthlyAvgUnit')}</Text>
                </LinearGradient>
              </View>
              {/* Two smaller cards side by side */}
              <View style={styles.grid}>
                <StatCard value={formatHours(stats.allTime.totalMinutes)} label={t('stats.allTimeHours')} />
                <StatCard value={String(stats.allTime.totalPages)} label={t('stats.allTimePages')} />
              </View>
              {/* Annual projection banner */}
              <View style={styles.projectionCardWrapper}>
              <LinearGradient
                colors={['#1e2d21', '#273d2a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.projectionCard}
              >
                <View style={styles.projectionIconWrap}>
                  <Ionicons name="trending-up" size={22} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={styles.projectionBody}>
                  <Text style={styles.projectionLabel}>
                    {t('stats.projectionText')}
                  </Text>
                  <Text style={styles.projectionHighlight}>
                    {Math.round(monthlyAvg * 12)} {t('stats.projectionUnit')}
                  </Text>
                </View>
              </LinearGradient>
              </View>
            </>
          )}

          {/* Actividad del Período — solo semana */}
          {period === 'week' && (
            <>
              <Text style={[styles.elegantTitle, { color: theme.textPrimary }]}>
                {t(`stats.periodActivity${period.charAt(0).toUpperCase() + period.slice(1)}`)}
              </Text>

              {stats.totalMinutes === 0 && stats.totalPages === 0 && stats.completedBooks === 0 ? (
                <Text style={[styles.noPeriodText, { color: theme.textTertiary }]}>
                  {t('stats.noPeriodActivity')}
                </Text>
              ) : (
                <>
                  {/* Period hero card — Libros Terminados */}
                  <View style={styles.heroCardWrapper}>
                    <LinearGradient
                      colors={['#4a148c', '#7b1fa2', '#ab47bc', '#ce93d8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.heroCard}
                    >
                      <Text style={styles.heroLabel}>{t('stats.booksFinished')}</Text>
                      <Text style={styles.heroValue}>{stats.completedBooks}</Text>
                    </LinearGradient>
                  </View>
                  {/* Two smaller cards side by side */}
                  <View style={styles.grid}>
                    <StatCard value={formatHours(stats.totalMinutes)} label={t('stats.hoursRead')} />
                    <StatCard value={String(stats.totalPages)} label={t('stats.pagesRead')} />
                  </View>
                </>
              )}
            </>
          )}

          {/* Consistencia semanal — solo semana */}
          {period === 'week' && stats.from && stats.to && (
            <>
              <Text style={[styles.elegantTitle, { color: theme.textPrimary }]}>
                {t('stats.readingActivity')}
              </Text>
              <WeekConsistencyTracker
                activeDays={stats.activeDays ?? []}
                from={stats.from}
                to={stats.to}
                weekStart={weekStart}
                dayNames={days}
              />
            </>
          )}

          {/* Horas leídas por semana — solo mes */}
          {period === 'month' && weeklyActivity.length > 0 && (
            <>
              <Text style={[styles.elegantTitle, { color: theme.textPrimary }]}>
                {t('stats.hoursPerWeek')}
              </Text>
              <WeeklyActivityChart data={weeklyActivity.slice(-1)} />
            </>
          )}

          {/* Categorías — por páginas leídas en el período */}
          {stats.categories?.length > 0 && (
            <>
              <Text style={[styles.elegantTitle, { color: theme.textPrimary }]}>
                {t(`stats.topCategories${period.charAt(0).toUpperCase() + period.slice(1)}`)}
              </Text>
              <View style={[styles.card, { borderColor: theme.borderColor }]}>
                {stats.categories.map((cat, idx) => (
                  <CategoryItem
                    key={cat.name}
                    name={cat.name}
                    pages={cat.pages}
                    index={idx}
                    totalPages={stats.categories.reduce((s, c) => s + c.pages, 0)}
                  />
                ))}
              </View>
            </>
          )}

          <View style={styles.brandFooter}>
            <Svg height={22} width={140}>
              <Defs>
                <SvgGradient id="greenGradStats" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#1b5e20" />
                  <Stop offset="1" stopColor="#81c784" />
                </SvgGradient>
              </Defs>
              <SvgText fill="url(#greenGradStats)" fontSize="11" fontWeight="bold" x="70" y="16" textAnchor="middle" letterSpacing="1">
                By MountLion
              </SvgText>
            </Svg>
          </View>
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
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 12,
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
  elegantTitle: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  chartSubtitle: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
    marginTop: -10,
    marginBottom: 16,
  },
  noPeriodText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },
  heroCardWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroCard: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 68,
  },
  projectionCardWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  projectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  projectionIconWrap: {
    marginRight: 16,
  },
  projectionBody: {
    flex: 1,
  },
  projectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
  projectionHighlight: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#ffffff',
  },
  heroSeparator: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 14,
    marginBottom: 10,
  },
  heroAvgLabel: {
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  heroAvgValue: {
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 4,
  },
});
