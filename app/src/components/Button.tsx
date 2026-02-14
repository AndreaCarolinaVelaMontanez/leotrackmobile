import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const buttonStyles: ViewStyle[] = [styles.base];
  const labelStyles: TextStyle[] = [styles.label];

  switch (variant) {
    case 'primary':
      buttonStyles.push({ backgroundColor: theme.accentPrimary });
      labelStyles.push({ color: '#FFFFFF' });
      break;
    case 'secondary':
      buttonStyles.push({ backgroundColor: theme.bgTertiary });
      labelStyles.push({ color: theme.textPrimary });
      break;
    case 'text':
      buttonStyles.push({ backgroundColor: 'transparent', paddingVertical: 8 });
      labelStyles.push({ color: theme.accentPrimary });
      break;
  }

  if (disabled || loading) {
    buttonStyles.push({ opacity: 0.6 });
  }

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : theme.accentPrimary}
        />
      ) : (
        <Text style={[...labelStyles, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
