import { useRef, useState, type ReactNode } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MapPin, ShoppingBag, ShieldCheck, Sparkles, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';
import { Button, HStack, Screen, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const LANG_STORAGE_KEY = 'lokul.language';

// Top languages shown as chips (en + 5 major Indian languages)
const TOP_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

const { width: SCREEN_W } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: ReactNode;
  illustration: ReactNode;
};

function IllustrationCircle({
  bg,
  children,
  liveText,
  pinText,
}: {
  bg: string;
  children: ReactNode;
  liveText: string;
  pinText: string;
}) {
  return (
    <View style={[styles.illustration, { backgroundColor: bg }]}>
      {children}
      <View style={[styles.floatingPill, { top: 24, right: -12, backgroundColor: colors.surface.background }]}>
        <Bell size={14} color={colors.brand[600]} />
        <Text variant="caption" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
          {liveText}
        </Text>
      </View>
      <View style={[styles.floatingPill, { bottom: 32, left: -16, backgroundColor: colors.surface.background }]}>
        <MapPin size={14} color={colors.accent[500]} />
        <Text variant="caption" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
          {pinText}
        </Text>
      </View>
    </View>
  );
}

export default function SplashCarousel() {
  const { t } = useTranslation(['onboarding', 'common']);
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const slides: Slide[] = [
    {
      key: 'welcome',
      title: t('onboarding:slide_welcome_title'),
      subtitle: t('onboarding:slide_welcome_subtitle'),
      badge: t('onboarding:slide_welcome_badge'),
      icon: <Sparkles size={20} color={colors.brand[600]} />,
      illustration: (
        <IllustrationCircle bg={colors.brand[50]} liveText={t('onboarding:live')} pinText={t('onboarding:pin_sample')}>
          <Users size={88} color={colors.brand[600]} strokeWidth={1.5} />
        </IllustrationCircle>
      ),
    },
    {
      key: 'safety',
      title: t('onboarding:slide_safety_title'),
      subtitle: t('onboarding:slide_safety_subtitle'),
      badge: t('onboarding:slide_safety_badge'),
      icon: <ShieldCheck size={20} color={colors.semantic.success} />,
      illustration: (
        <IllustrationCircle bg={colors.semantic.successBg} liveText={t('onboarding:live')} pinText={t('onboarding:pin_sample')}>
          <ShieldCheck size={88} color={colors.semantic.success} strokeWidth={1.5} />
        </IllustrationCircle>
      ),
    },
    {
      key: 'local',
      title: t('onboarding:slide_local_title'),
      subtitle: t('onboarding:slide_local_subtitle'),
      badge: t('onboarding:slide_local_badge'),
      icon: <ShoppingBag size={20} color={colors.accent[500]} />,
      illustration: (
        <IllustrationCircle bg={colors.accent[50]} liveText={t('onboarding:live')} pinText={t('onboarding:pin_sample')}>
          <ShoppingBag size={88} color={colors.accent[500]} strokeWidth={1.5} />
        </IllustrationCircle>
      ),
    },
  ];
  const [selectedLang, setSelectedLang] = useState(i18n.language ?? 'en');
  const isLast = index === slides.length - 1;

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== index) setIndex(i);
  };

  const selectLanguage = async (code: string) => {
    setSelectedLang(code);
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem(LANG_STORAGE_KEY, code);
  };

  const goNext = () => {
    if (isLast) {
      router.replace('/(onboarding)/permissions');
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const skip = () => router.replace('/(onboarding)/permissions');

  return (
    <Screen padded={false} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <HStack align="center" gap={2}>
          <View style={styles.logoMark}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>L</Text>
          </View>
          <Text variant="label" style={{ color: colors.surface.heading, fontWeight: '700' }}>
            {t('common:app_name')}
          </Text>
        </HStack>
        {!isLast ? (
          <Pressable onPress={skip} hitSlop={12}>
            <Text variant="label" tone="secondary">
              {t('common:skip')}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_W }}>
            <VStack gap={6} align="center" style={styles.slide}>
              {item.illustration}
              <VStack gap={3} align="center" style={{ paddingHorizontal: spacing[6] }}>
                <HStack
                  gap={1.5}
                  align="center"
                  style={{
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[1],
                    backgroundColor: colors.gray[100],
                    borderRadius: radius.full,
                  }}
                >
                  {item.icon}
                  <Text variant="caption" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
                    {item.badge}
                  </Text>
                </HStack>
                <Text variant="h1" style={{ textAlign: 'center' }}>
                  {item.title}
                </Text>
                <Text variant="bodyLg" tone="secondary" style={{ textAlign: 'center' }}>
                  {item.subtitle}
                </Text>
              </VStack>
            </VStack>
          </View>
        )}
      />

      <VStack gap={5} style={styles.footer}>
        {/* Language selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.langRow}
        >
          {TOP_LANGUAGES.map((lang) => {
            const active = selectedLang === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => selectLanguage(lang.code)}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: active ? colors.brand[600] : colors.surface.background,
                    borderColor: active ? colors.brand[600] : colors.surface.border,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    color: active ? '#fff' : colors.surface.foreground,
                    fontWeight: '600',
                  }}
                >
                  {lang.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <HStack gap={2} justify="center">
          {slides.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.dot,
                {
                  width: i === index ? 24 : 8,
                  backgroundColor: i === index ? colors.brand[600] : colors.gray[300],
                },
              ]}
            />
          ))}
        </HStack>

        <Button
          label={isLast ? t('common:get_started') : t('common:continue')}
          onPress={goNext}
          fullWidth
          size="lg"
        />

        <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          {t('common:by_continuing_agree', {
            terms: t('common:terms'),
            privacy: t('common:privacy_policy'),
          })}
        </Text>
      </VStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing[6],
  },
  illustration: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floatingPill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  langRow: {
    paddingHorizontal: spacing[5],
    gap: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },
  langChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
