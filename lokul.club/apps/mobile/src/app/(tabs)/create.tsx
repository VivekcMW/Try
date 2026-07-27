// PRD §00.11 — central "+" action sheet
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertOctagon,
  Bike,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Heart,
  PackagePlus,
  PenSquare,
  Scissors,
  ShoppingBag,
  Store,
  Tag,
  Users,
  UserPlus,
  Utensils,
  Wrench,
  X,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, spacing } from '@lokul/ui-tokens';

interface Action {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  tint: string;
  href: string;
  danger?: boolean;
}

const SECTIONS: { title: string; items: Action[] }[] = [
  {
    title: 'Share with neighbors',
    items: [
      {
        id: 'post',
        title: 'Post update',
        subtitle: 'Tell your locality what’s happening',
        Icon: PenSquare,
        tint: colors.brand[600],
        href: '/(feed)/compose',
      },
      {
        id: 'sell',
        title: 'Sell something',
        subtitle: 'Classifieds — sofa, cycle, books…',
        Icon: Tag,
        tint: '#8B5CF6',
        href: '/(classifieds)/create',
      },
    ],
  },
  {
    title: 'Offer & earn',
    items: [
      {
        id: 'cook',
        title: 'Post today’s menu',
        subtitle: 'Home cook — tiffin or thali orders',
        Icon: Utensils,
        tint: '#F97316',
        href: '/(peer)/cook',
      },
      {
        id: 'rider',
        title: 'Offer an errand run',
        subtitle: 'Rider — deliveries, pickups',
        Icon: Bike,
        tint: '#0EA5E9',
        href: '/(peer)/rider',
      },
      {
        id: 'coach',
        title: 'List a session / batch',
        subtitle: 'Coach — yoga, tutoring, fitness',
        Icon: GraduationCap,
        tint: '#10B981',
        href: '/(peer)/coach',
      },
      {
        id: 'reseller',
        title: 'Relist an item',
        subtitle: 'Reseller — buy low, resell',
        Icon: PackagePlus,
        tint: '#A855F7',
        href: '/(peer)/reseller',
      },
      {
        id: 'handyman',
        title: 'Offer handyman services',
        subtitle: 'Plumbing, electrical, carpentry',
        Icon: Wrench,
        tint: '#78716C',
        href: '/(peer)/handyman',
      },
      {
        id: 'tutor',
        title: 'Offer tutoring',
        subtitle: 'Academic coaching from home',
        Icon: BookOpen,
        tint: '#8B5CF6',
        href: '/(peer)/tutor',
      },
      {
        id: 'beautician',
        title: 'Offer beauty services',
        subtitle: 'Home salon — hair, skin, nails',
        Icon: Scissors,
        tint: '#EC4899',
        href: '/(peer)/beautician',
      },
      {
        id: 'caretaker',
        title: 'Offer care services',
        subtitle: 'Pet, baby & elder care',
        Icon: Heart,
        tint: '#F59E0B',
        href: '/(peer)/caretaker',
      },
    ],
  },
  {
    title: 'Build community',
    items: [
      {
        id: 'community',
        title: 'Create a community',
        subtitle: 'Interest, activity, or buying group',
        Icon: Users,
        tint: '#EC4899',
        href: '/(groups)/create',
      },
      {
        id: 'groupbuy',
        title: 'Start a group buy',
        subtitle: 'Pool demand, get bulk pricing',
        Icon: ShoppingBag,
        tint: '#F59E0B',
        href: '/(groupbuy)/create',
      },
      {
        id: 'business',
        title: 'Register a local business',
        subtitle: 'Kirana, salon, clinic, school',
        Icon: Store,
        tint: '#0D9488',
        href: '/(business)/onboard',
      },
      {
        id: 'invite',
        title: 'Invite your friends',
        subtitle: 'Earn ₹50 credits for every neighbor who joins',
        Icon: UserPlus,
        tint: '#6366F1',
        href: '/(invite)/invite-friends',
      },
    ],
  },
  {
    title: 'Safety',
    items: [
      {
        id: 'sos',
        title: 'Send SOS',
        subtitle: 'Alert everyone within 200 m',
        Icon: AlertOctagon,
        tint: '#DC2626',
        href: '/(safety)/sos-active',
        danger: true,
      },
    ],
  },
];

export default function CreateSheet() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Create</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
        >
          <X size={20} color={colors.surface.heading} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{sec.title.toUpperCase()}</Text>
            <View style={styles.card}>
              {sec.items.map((item, idx) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    router.back();
                    setTimeout(() => router.push(item.href as never), 80);
                  }}
                  style={({ pressed }) =>
                    pressed ? { backgroundColor: colors.surface.surfaceMuted } : undefined
                  }
                >
                  <View
                    style={[
                      styles.row,
                      idx < sec.items.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: item.tint + '1A' }]}>
                      <item.Icon size={20} color={item.tint} strokeWidth={2.2} />
                    </View>
                    <View style={styles.textBlock}>
                      <Text style={[styles.itemTitle, item.danger && styles.dangerText]}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <ChevronRight size={18} color={colors.gray[400]} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  section: { marginBottom: spacing[5] },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray[500],
    letterSpacing: 0.6,
    marginBottom: spacing[2],
    paddingHorizontal: spacing[1],
  },
  card: {
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface.heading,
    lineHeight: 20,
  },
  itemSubtitle: {
    fontSize: 13,
    color: colors.gray[500],
    lineHeight: 18,
  },
  dangerText: {
    color: '#DC2626',
  },
});
