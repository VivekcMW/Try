import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  BookUser,
  Building2,
  Car,
  Check,
  FileText,
  FolderOpen,
  IdCard,
  Info,
  Landmark,
  Plane,
  Vote,
  Zap,
} from 'lucide-react-native';
import {
  Badge,
  Button,
  Card,
  HStack,
  Screen,
  StepHeader,
  Text,
  VStack,
} from '@/components/ui';
import { proofMeta, useVerificationStore, type ProofType } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const OPTIONS: { id: ProofType; Icon: typeof FileText; recommended?: boolean }[] = [
  { id: 'digilocker', Icon: FolderOpen, recommended: true },
  { id: 'aadhaar', Icon: IdCard },
  { id: 'pan', Icon: Landmark },
  { id: 'passport', Icon: Plane },
  { id: 'driving', Icon: Car },
  { id: 'voter', Icon: Vote },
  { id: 'ration', Icon: BookUser },
  { id: 'rent', Icon: FileText },
  { id: 'bill', Icon: Zap },
  { id: 'noc', Icon: Building2 },
];

export default function SilverProofScreen() {
  const router = useRouter();
  const skipVerification = useVerificationStore((s) => s.skipVerification);
  const [selected, setSelected] = useState<ProofType | null>('digilocker');

  const onContinue = () => {
    if (!selected) return;
    router.push({ pathname: '/(verification)/silver-upload', params: { type: selected } });
  };

  return (
    <Screen padded={false}>
      <StepHeader step={1} total={3} />

      <View style={styles.body}>
        <VStack gap={2}>
          <Text variant="h2">Pick a proof type</Text>
          <Text variant="body" tone="secondary">
            Upload one document that shows your name and current flat address. We OCR it
            instantly and a human reviews within 24 hours.
          </Text>
        </VStack>

        <VStack gap={3}>
          {OPTIONS.map(({ id, Icon, recommended }) => {
            const isActive = selected === id;
            const meta = proofMeta[id];
            return (
              <Pressable
                key={id}
                onPress={() => setSelected(id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <Card
                  padding={4}
                  elevation="none"
                  bordered
                  style={
                    isActive
                      ? {
                          ...styles.option,
                          borderColor: colors.brand[600],
                          backgroundColor: colors.brand[50],
                          borderWidth: 2,
                        }
                      : styles.option
                  }
                >
                  <HStack gap={3} align="center">
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: isActive ? colors.brand[100] : colors.gray[100] },
                      ]}
                    >
                      <Icon
                        size={22}
                        color={isActive ? colors.brand[700] : colors.gray[600]}
                      />
                    </View>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <HStack gap={2} align="center">
                        <Text
                          variant="body"
                          style={{ fontWeight: '700', color: colors.surface.heading }}
                        >
                          {meta.title}
                        </Text>
                        {recommended ? <Badge label="Recommended" tone="brand" /> : null}
                      </HStack>
                      <Text variant="caption" tone="secondary">
                        {meta.desc}
                      </Text>
                    </VStack>
                    <View
                      style={[
                        styles.radio,
                        isActive && {
                          borderColor: colors.brand[600],
                          backgroundColor: colors.brand[600],
                        },
                      ]}
                    >
                      {isActive ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
                    </View>
                  </HStack>
                </Card>
              </Pressable>
            );
          })}
        </VStack>

        <Card padding={3} elevation="none" style={styles.infoCard}>
          <HStack gap={2} align="center">
            <Info size={16} color={colors.semantic.info} />
            <Text variant="caption" style={{ color: colors.semantic.info, flex: 1 }}>
              Your document is encrypted, used only for verification and never shown to other
              residents.
            </Text>
          </HStack>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={onContinue}
          disabled={!selected}
          rightIcon={<ArrowRight size={20} color="#fff" />}
          fullWidth
          size="lg"
        />
        <View style={{ height: spacing[2] }} />
        <Button
          label="Skip for now"
          variant="ghost"
          onPress={() => { skipVerification(); router.replace('/(tabs)'); }}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4], gap: spacing[5] },
  option: { borderColor: colors.surface.border },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surface.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: { backgroundColor: colors.semantic.infoBg },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], paddingTop: spacing[3] },
});
