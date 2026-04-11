import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

const GRADIENT_COLORS: [string, string, string] = ['#2a0040', '#490a66', '#7a2d99'];

interface FilterTabsProps {
  tabs: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function FilterTabs({ tabs, activeIndex, onSelect }: FilterTabsProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              { borderColor: isActive ? '#490a66' : theme.borderColor, overflow: 'hidden' },
            ]}
            onPress={() => onSelect(index)}
          >
            {isActive ? (
              <LinearGradient
                colors={GRADIENT_COLORS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabInner}
              >
                <Text style={[styles.tabText, { color: '#FFFFFF' }]}>{tab}</Text>
              </LinearGradient>
            ) : (
              <Text style={[styles.tabText, { color: theme.textSecondary }]}>{tab}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 30,
    paddingVertical: 20
  },
  tab: {
    borderRadius: 12,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  tabInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
