import { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

type ToastType = 'error' | 'success';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'error' });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: ToastType = 'error') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ visible: true, message, type });
    timer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  return { toast, showToast };
}

export function Toast({ toast }: { toast: ToastState }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast.visible]);

  if (!toast.message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        toast.type === 'error' ? styles.error : styles.success,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  error: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F5C2C7',
  },
  success: {
    backgroundColor: '#F0FAF4',
    borderWidth: 1,
    borderColor: '#B7E4C7',
  },
  text: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.5,
    lineHeight: 18,
    textAlign: 'center',
    color: '#1C1024',
  },
});
