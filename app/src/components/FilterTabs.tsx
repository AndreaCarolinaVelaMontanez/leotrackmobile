import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

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
              {
                backgroundColor: isActive ? theme.accentPrimary : theme.bgPrimary,
                borderColor: isActive ? theme.accentPrimary : theme.borderColor,
              },
            ]}
            onPress={() => onSelect(index)}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {tab}
            </Text>
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
  },
});
