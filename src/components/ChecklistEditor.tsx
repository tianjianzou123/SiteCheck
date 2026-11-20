import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistItem, ChecklistResult } from '@/types/report';
import { colors, radius, spacing } from '@/constants/theme';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const resultOptions: { value: ChecklistResult; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'pass', label: 'Pass', icon: 'checkmark-circle' },
  { value: 'fail', label: 'Fail', icon: 'close-circle' },
  { value: 'not_checked', label: 'N/A', icon: 'remove-circle' },
];

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const update = (id: string, result: ChecklistResult) => {
    onChange(items.map((item) => (item.id === id ? { ...item, result } : item)));
  };

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.options}>
            {resultOptions.map((option) => {
              const selected = item.result === option.value;
              const tone =
                option.value === 'pass'
                  ? colors.success
                  : option.value === 'fail'
                    ? colors.danger
                    : colors.textMuted;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => update(item.id, option.value)}
                  style={[styles.option, selected && { borderColor: tone, backgroundColor: `${tone}12` }]}
                >
                  <Ionicons name={option.icon} size={17} color={selected ? tone : colors.textMuted} />
                  <Text style={[styles.optionText, selected && { color: tone }]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  options: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  optionText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
});
