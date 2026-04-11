import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { VALID_TAGS, BookTagKey } from '../constants/bookTags';

interface TagSelectorProps {
  selected: string[];
  saving: boolean;
  onToggle: (tag: BookTagKey) => void;
}

export function TagSelector({ selected, saving, onToggle }: TagSelectorProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { borderColor: theme.borderColor }]}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t('bookTags.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
            {t('bookTags.subtitle')}
          </Text>
        </View>
        {saving && <ActivityIndicator size="small" color={theme.accentPrimary} />}
      </View>

      <View style={styles.tags}>
        {VALID_TAGS.map((tag) => {
          const isSelected = selected.includes(tag);
          const isDisabled = !isSelected && selected.length >= 2;

          return (
            <TouchableOpacity
              key={tag}
              onPress={() => onToggle(tag)}
              disabled={isDisabled}
              activeOpacity={0.7}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.accentPrimary + '20' : 'transparent',
                  borderColor: isSelected ? theme.accentPrimary : theme.borderColor,
                  opacity: isDisabled ? 0.4 : 1,
                },
              ]}
            >
              <Text style={[
                styles.chipText,
                { color: isSelected ? theme.accentPrimary : theme.textSecondary },
              ]}>
                {t(`bookTags.${tag}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
