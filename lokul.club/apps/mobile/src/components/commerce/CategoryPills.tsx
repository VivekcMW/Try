import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { colors, radius, spacing, fontSize } from '@lokul/ui-tokens';

interface Category {
  id: string;
  icon: string;
  label: string;
  route: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: 'food', icon: '🍕', label: 'Food', route: '/(discover)/catalog?category=food', color: colors.semantic.danger },
  { id: 'grocery', icon: '🛒', label: 'Grocery', route: '/(discover)/catalog?category=grocery', color: colors.semantic.success },
  { id: 'pharmacy', icon: '💊', label: 'Pharmacy', route: '/(discover)/catalog?category=pharmacy', color: colors.brand[600] },
  { id: 'salon', icon: '💇', label: 'Salon', route: '/(marketplace)/category/salon', color: colors.accent[500] },
  { id: 'laundry', icon: '👕', label: 'Laundry', route: '/(marketplace)/category/laundry', color: colors.brand[500] },
  { id: 'ride', icon: '🚗', label: 'Ride', route: '/(discover)/carpool', color: colors.accent[600] },
  { id: 'delivery', icon: '📦', label: 'Delivery', route: '/(delivery)', color: colors.brand[400] },
  { id: 'more', icon: '➕', label: 'More', route: '/(marketplace)', color: colors.gray[500] },
];

interface CategoryPillsProps {
  activeId?: string;
  onCategoryPress?: (category: Category) => void;
}

export function CategoryPills({ activeId, onCategoryPress }: Readonly<CategoryPillsProps>) {
  const router = useRouter();

  const handlePress = (category: Category) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else {
      router.push(category.route as any);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {CATEGORIES.map((category) => {
        const isActive = activeId === category.id;
        return (
          <Pressable
            key={category.id}
            style={[
              styles.pill,
              isActive && styles.pillActive,
            ]}
            onPress={() => handlePress(category)}
            accessibilityRole="button"
            accessibilityLabel={`${category.label} category`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  pill: {
    height: 40,
    paddingHorizontal: spacing[3.5],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    backgroundColor: colors.surface.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  pillActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  labelActive: {
    color: colors.surface.background,
  },
});
