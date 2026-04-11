import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { MonthActivity } from '../api/stats';

interface Props {
  data: MonthActivity[];
}

const BAR_MAX_HEIGHT = 110;
const BAR_COLORS: [string, string] = ['#fbbf24', '#b45309'];

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export function WeeklyActivityChart({ data }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const allMinutes = data.flatMap((m) => m.weeks.map((w) => w.minutes));
  const maxMinutes = Math.max(...allMinutes, 1);

  return (
    <View style={styles.wrapper}>
      {data.map((month, mi) => (
        <View key={`${month.monthKey}-${month.year}`} style={[styles.monthBlock, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }, mi > 0 && styles.monthBlockSeparator]}>
          {/* Month header */}
          <View style={styles.monthHeader}>
            <View style={[styles.dot, { backgroundColor: BAR_COLORS[0] }]} />
            <Text style={[styles.monthName, { color: theme.textPrimary }]}>
              {t(`stats.${month.monthKey}`)}
            </Text>
          </View>

          {/* Bars */}
          <View style={styles.barsRow}>
            {month.weeks.map((week) => {
              const barH = week.minutes > 0
                ? Math.max(Math.round((week.minutes / maxMinutes) * BAR_MAX_HEIGHT), 12)
                : 4;
              return (
                <View key={week.label} style={styles.barCol}>
                  <View style={[styles.barTrack, { height: BAR_MAX_HEIGHT }]}>
                    <View style={[styles.barOuter, { borderRadius: 6, overflow: 'hidden', height: barH }]}>
                      <LinearGradient
                        colors={week.minutes > 0 ? BAR_COLORS : ['#3a3a3a', '#2a2a2a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>
                  </View>
                  <Text style={[styles.barLabel, { color: theme.textTertiary }]}>{week.label}</Text>
                  <Text style={[styles.barValue, { color: theme.textSecondary }]}>
                    {week.minutes > 0 ? formatMinutes(week.minutes) : '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  monthBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  monthBlockSeparator: {
    marginTop: 0,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  barOuter: {
    width: '100%',
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  barValue: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
