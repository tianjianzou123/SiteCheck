import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, multiline, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.errorInput,
          style,
        ]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  multiline: { minHeight: 112, paddingTop: spacing.md },
  errorInput: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
  hint: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
});
