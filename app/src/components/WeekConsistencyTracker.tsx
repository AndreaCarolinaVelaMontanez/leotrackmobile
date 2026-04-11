import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  activeDays: string[];
  from: string;
  to: string;
  weekStart: 'monday' | 'sunday';
  dayNames: string[];
}

export function WeekConsistencyTracker({ activeDays, from, weekStart, dayNames }: Props) {
  const { theme } = useTheme();

  // Build the 7 days of the week starting from 'from'
  const [fy, fm, fd] = from.split('-').map(Number);
  const startDate = new Date(fy, fm - 1, fd);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayIndex = d.getDay(); // 0=Sun, 1=Mon...
    const active = activeDays.includes(dateStr);
    return { dateStr, dayIndex, active, dayNum: d.getDate() };
  });

  // Reorder dayNames to match weekStart
  const orderedDayNames = weekStart === 'monday'
    ? [...dayNames.slice(1), dayNames[0]]  // Mon-Sun
    : dayNames;                             // Sun-Sat

  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary, borderColor: theme.borderColor }]}>
      <View style={styles.row}>
        {days.map((day, i) => (
          <View key={day.dateStr} style={styles.dayCol}>
            {day.active ? (
              <View style={[styles.squareWrapper, { overflow: 'hidden', borderRadius: 8 }]}>
                <LinearGradient
                  colors={['#1b5e20', '#388e3c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.squareActive}
                >
                  <Text style={styles.checkmark}>✓</Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={[styles.squareInactive, { borderColor: theme.borderColor }]} />
            )}
            <Text style={[styles.dayName, { color: theme.textTertiary }]}>
              {orderedDayNames[i]}
            </Text>
            <Text style={[styles.dayNum, { color: day.active ? theme.accentPrimary : theme.textTertiary }]}>
              {day.dayNum}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  squareWrapper: {
    width: 36,
    height: 36,
  },
  squareActive: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareInactive: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 11,
    fontWeight: '300',
    marginTop: 2,
  },
});
