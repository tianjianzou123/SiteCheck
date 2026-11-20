import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceChipsProps<T extends string> {
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  scrollable?: boolean;
}

export function ChoiceChips<T extends string>({
  choices,
  value,
  onChange,
  scrollable = false,
}: ChoiceChipsProps<T>) {
  const content = choices.map((choice) => {
    const selected = choice.value === value;
    return (
      <Pressable
        key={choice.value}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        onPress={() => onChange(choice.value)}
        style={({ pressed }) => [
          styles.chip,
          selected && styles.selectedChip,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.label, selected && styles.selectedLabel]}>{choice.label}</Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={[styles.row, styles.wrap]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 2 },
  wrap: { flexWrap: 'wrap' },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: { backgroundColor: colors.navy, borderColor: colors.navy },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  selectedLabel: { color: colors.white },
  pressed: { opacity: 0.75 },
});
