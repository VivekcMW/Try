/**
 * NewsCard — renders a single AI-summarised locality news item inside the feed.
 *
 * Alert items (isAlert=true) get a danger accent stripe; regular items use
 * a neutral info style.  Tapping "Read full" opens the source URL.
 */
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import {
  AlertTriangle,
  Building2,
  CloudRain,
  ExternalLink,
  Globe,
  HeartPulse,
  MapPin,
  Newspaper,
  ShieldAlert,
} from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import type { LocalityNewsItem, NewsCategory } from '@/services/newsService';

// ── Category metadata ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  NewsCategory,
  { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'; Icon: React.ComponentType<{ size: number; color: string }> }
> = {
  civic:     { label: 'Civic',     tone: 'brand',    Icon: Building2   },
  safety:    { label: 'Safety',    tone: 'danger',   Icon: ShieldAlert },
  weather:   { label: 'Weather',   tone: 'info',     Icon: CloudRain   },
  health:    { label: 'Health',    tone: 'success',  Icon: HeartPulse  },
  transport: { label: 'Traffic',   tone: 'warning',  Icon: MapPin      },
  local:     { label: 'Local',     tone: 'neutral',  Icon: Globe       },
};

const TONE_FG: Record<string, string> = {
  neutral: colors.gray[700],
  brand:   colors.brand[700],
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  danger:  colors.semantic.danger,
  info:    colors.semantic.info,
};

// ── Component ─────────────────────────────────────────────────────────────────

export interface NewsCardProps {
  item: LocalityNewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.local;
  const CatIcon = meta.Icon;
  const fg = TONE_FG[meta.tone] ?? colors.gray[700];

  const ageLabel = relativeAge(item.publishedAt);

  async function handleReadFull() {
    const supported = await Linking.canOpenURL(item.sourceUrl);
    if (supported) Linking.openURL(item.sourceUrl);
  }

  return (
    <Card
      padding={4}
      elevation="sm"
      style={{ ...styles.card, ...(item.isAlert ? styles.alertBorder : {}) }}
    >
      {/* Header row */}
      <HStack gap={2} align="center" style={{ marginBottom: spacing[2] }}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: item.isAlert ? colors.semantic.dangerBg : colors.gray[100] },
          ]}
        >
          {item.isAlert ? (
            <AlertTriangle size={14} color={colors.semantic.danger} />
          ) : (
            <Newspaper size={14} color={colors.brand[600]} />
          )}
        </View>

        <Text
          variant="caption"
          style={{
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: item.isAlert ? colors.semantic.danger : colors.brand[600],
          }}
        >
          {item.isAlert ? 'Alert' : 'Local News'}
        </Text>

        <Text variant="caption" tone="secondary" style={{ marginLeft: 'auto' }}>
          {ageLabel} · {item.sourceName}
        </Text>
      </HStack>

      {/* Headline */}
      <Text
        variant="body"
        style={{ fontWeight: '700', color: colors.surface.heading, marginBottom: spacing[1] }}
        numberOfLines={2}
      >
        {item.headline}
      </Text>

      {/* Summary */}
      <Text
        variant="body"
        style={{ color: colors.surface.foreground, lineHeight: 21, marginBottom: spacing[3] }}
        numberOfLines={3}
      >
        {item.summary}
      </Text>

      {/* Footer */}
      <HStack gap={2} align="center">
        <Badge
          label={meta.label}
          tone={meta.tone}
          leftIcon={<CatIcon size={10} color={fg} />}
        />

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleReadFull}
          style={styles.readBtn}
          accessibilityRole="link"
          accessibilityLabel="Read full article"
        >
          <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
            Read full
          </Text>
          <ExternalLink size={12} color={colors.brand[600]} />
        </Pressable>
      </HStack>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeAge(iso: string): string {
  try {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const m = Math.floor(diff / 60_000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  } catch {
    return '';
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    gap: 0,
  },
  alertBorder: {
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.danger,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
