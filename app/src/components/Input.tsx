import { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  onClear?: () => void;
  searchIcon?: boolean;
}

export function Input({ label, error, style, secureTextEntry, onClear, searchIcon, ...props }: InputProps) {
  const { theme } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const isPassword = secureTextEntry !== undefined && secureTextEntry;
  const showClear = onClear && typeof props.value === 'string' && props.value.length > 0;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}
      <View style={styles.inputRow}>
        {searchIcon && (
          <View style={styles.searchIconBox}>
            <Ionicons name="search-outline" size={18} color={theme.textTertiary} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.bgPrimary,
              color: theme.textPrimary,
              borderColor: error ? theme.error : theme.borderColor,
              paddingLeft: searchIcon ? 44 : 16,
              paddingRight: isPassword || showClear ? 48 : 16,
            },
            style,
          ]}
          placeholder={focused ? '' : props.placeholder}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={isPassword && hidden}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setHidden(!hidden)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        )}
        {showClear && !isPassword && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={onClear}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputRow: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 15,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  searchIconBox: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
