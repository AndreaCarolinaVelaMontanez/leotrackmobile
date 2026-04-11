import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

const CATEGORY_COLORS = [
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#a855f7',
  '#ef4444',
  '#06b6d4',
];

const CATEGORY_KEY_MAP: Record<string, string> = {
  'Fiction': 'addManual.catFiction',
  'Business': 'addManual.catBusiness',
  'Self-Help': 'addManual.catSelfHelp',
  'Computers': 'addManual.catComputers',
  'Science': 'addManual.catScience',
  'Other': 'addManual.catOther',
  'Uncategorized': 'addManual.catOther',
};

interface CategoryItemProps {
  name: string;
  pages: number;
  index: number;
  totalPages: number;
}

export function CategoryItem({ name, pages, index, totalPages }: CategoryItemProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  const pct = totalPages > 0 ? Math.round((pages / totalPages) * 100) : 0;
  const translatedName = CATEGORY_KEY_MAP[name] ? t(CATEGORY_KEY_MAP[name]) : name;

  return (
    <View style={styles.item}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.name, { color: theme.textPrimary }]}>{translatedName}</Text>
        <Text style={[styles.pct, { color: color }]}>{pct}%</Text>
      </View>
      <View style={[styles.trackBar, { backgroundColor: theme.borderColor }]}>
        <View style={[styles.fillBar, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pct: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    minWidth: 38,
    textAlign: 'right',
  },
  trackBar: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fillBar: {
    height: 3,
    borderRadius: 2,
  },
});
