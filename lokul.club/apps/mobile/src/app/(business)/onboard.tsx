import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Store } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import {
  BIZ_CATEGORY_META,
  CATEGORY_GROUPS,
  MERCHANT_TYPE_MAP,
  type BizCategory,
  type PaymentMode,
} from '@/store/businessStore';
import { useVerificationStore } from '@/store/verificationStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const DELIVERY_OPTS: { label: string; value: number }[] = [
  { label: 'None', value: 0 },
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
];

const SLOT_OPTS: { label: string; value: number }[] = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const PAYMENT_OPTS: { label: string; value: PaymentMode }[] = [
  { label: 'UPI', value: 'upi' },
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'COD', value: 'cod' },
];

export default function BusinessOnboard() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const tier = useVerificationStore((s) => s.tier);

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<BizCategory>('kirana');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [open, setOpen] = useState('08:00');
  const [close, setClose] = useState('22:00');
  const [deliveryRadius, setDeliveryRadius] = useState<number>(500);
  const [slotDurationMins, setSlotDurationMins] = useState(30);
  const [hasDineIn, setHasDineIn] = useState(true);
  const [hasDelivery, setHasDelivery] = useState(true);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>(['upi', 'cash']);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');

  const [submitting, setSubmitting] = useState(false);

  const merchantType = MERCHANT_TYPE_MAP[category];

  if (tier === 'bronze') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopBar onBack={() => router.back()} title="Register business" />
        <View style={styles.lockBox}>
          <Store size={48} color={colors.brand[600]} />
          <Text variant="h2" style={{ textAlign: 'center', fontWeight: '700' }}>Silver KYC needed</Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            Local businesses must complete Silver KYC. Submit address proof to continue.
          </Text>
          <View style={{ width: '100%', marginTop: spacing[4] }}>
            <Button label="Start KYC" onPress={() => router.replace('/(verification)/silver-proof')} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  function togglePayment(mode: PaymentMode) {
    setPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  }

  const submit = async () => {
    if (!userId || !pinCode) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/merchants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId, pinCode, name, category, merchantType, phone, address, bio, paymentModes,
          hoursOpen: open, hoursClose: close,
          deliveryRadius: merchantType === 'retail' || merchantType === 'food' ? deliveryRadius : undefined,
          slotDurationMins: merchantType === 'appointment' ? slotDurationMins : undefined,
          hasDineIn: merchantType === 'food' ? hasDineIn : undefined,
          hasDelivery: merchantType === 'food' ? hasDelivery : undefined,
          plan,
        }),
      });
      if (!res.ok) throw new Error('registration failed');
      router.replace('/(business)/dashboard');
    } catch {
      Alert.alert('Error', 'Could not register your business — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = step !== 1 || (!!name && !!phone);

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar onBack={handleBack} title={`Step ${step + 1} of 4`} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 0 && (
          <VStack gap={4}>
            <Text variant="h2" style={{ fontWeight: '700' }}>What kind of business?</Text>
            <Text variant="body" tone="secondary">Pick your category. You can refine later.</Text>
            {CATEGORY_GROUPS.map((group) => (
              <VStack key={group.type} gap={2}>
                <Text
                  variant="caption"
                  style={{ fontWeight: '700', color: colors.surface.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  {group.label}
                </Text>
                <View style={styles.catGrid}>
                  {group.categories.map((c) => {
                    const meta = BIZ_CATEGORY_META[c];
                    const active = category === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCategory(c)}
                        style={[styles.catBtn, active && { borderColor: meta.tint, backgroundColor: meta.tint + '18' }]}
                      >
                        <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
                        <Text variant="caption" style={{ fontWeight: '600', textAlign: 'center', fontSize: 11 }}>
                          {meta.label}
                        </Text>
                        {active && (
                          <View style={[styles.catCheck, { backgroundColor: meta.tint }]}>
                            <Check size={10} color="#fff" strokeWidth={3} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </VStack>
            ))}
          </VStack>
        )}

        {step === 1 && (
          <VStack gap={3.5}>
            <Text variant="h2" style={{ fontWeight: '700' }}>Business details</Text>
            <Field label="Business name" value={name} onChange={setName} placeholder="Sharma Kirana" />
            <Field label="Phone (visible to customers)" value={phone} onChange={setPhone} placeholder="+91 98xxxxxxxx" keyboardType="phone-pad" />
            <Field label="Address" value={address} onChange={setAddress} placeholder="Shop 12, near gate 2" multiline />
            <Field label="Short bio (1-2 lines)" value={bio} onChange={setBio} placeholder="3rd-generation kirana since 1998" multiline />
          </VStack>
        )}

        {step === 2 && (
          <VStack gap={4}>
            <Text variant="h2" style={{ fontWeight: '700' }}>Hours & setup</Text>
            <HStack gap={3}>
              <View style={{ flex: 1 }}><Field label="Opens" value={open} onChange={setOpen} placeholder="08:00" /></View>
              <View style={{ flex: 1 }}><Field label="Closes" value={close} onChange={setClose} placeholder="22:00" /></View>
            </HStack>

            {(merchantType === 'retail' || merchantType === 'food') && (
              <VStack gap={2}>
                <Text variant="caption" style={{ fontWeight: '700' }}>Delivery radius</Text>
                <View style={styles.chipRow}>
                  {DELIVERY_OPTS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setDeliveryRadius(opt.value)}
                      style={[styles.chip, deliveryRadius === opt.value && styles.chipActive]}
                    >
                      <Text
                        variant="caption"
                        style={{ fontWeight: '600', color: deliveryRadius === opt.value ? '#fff' : colors.surface.foreground }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </VStack>
            )}

            {merchantType === 'food' && (
              <VStack gap={2}>
                <View style={styles.switchRow}>
                  <Text variant="body">Dine-in available</Text>
                  <Switch
                    value={hasDineIn}
                    onValueChange={setHasDineIn}
                    trackColor={{ false: colors.surface.border, true: colors.brand[500] }}
                    thumbColor="#fff"
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text variant="body">Home delivery</Text>
                  <Switch
                    value={hasDelivery}
                    onValueChange={setHasDelivery}
                    trackColor={{ false: colors.surface.border, true: colors.brand[500] }}
                    thumbColor="#fff"
                  />
                </View>
              </VStack>
            )}

            {merchantType === 'appointment' && (
              <VStack gap={2}>
                <Text variant="caption" style={{ fontWeight: '700' }}>Slot duration</Text>
                <View style={styles.chipRow}>
                  {SLOT_OPTS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setSlotDurationMins(opt.value)}
                      style={[styles.chip, slotDurationMins === opt.value && styles.chipActive]}
                    >
                      <Text
                        variant="caption"
                        style={{ fontWeight: '600', color: slotDurationMins === opt.value ? '#fff' : colors.surface.foreground }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </VStack>
            )}
          </VStack>
        )}

        {step === 3 && (
          <VStack gap={4}>
            <Text variant="h2" style={{ fontWeight: '700' }}>Payments & plan</Text>
            <VStack gap={2}>
              <Text variant="caption" style={{ fontWeight: '700' }}>Accepted payments</Text>
              <View style={styles.chipRow}>
                {PAYMENT_OPTS.map((opt) => {
                  const active = paymentModes.includes(opt.value);
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => togglePayment(opt.value)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        variant="caption"
                        style={{ fontWeight: '600', color: active ? '#fff' : colors.surface.foreground }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </VStack>
            <PlanCard tier="free" selected={plan === 'free'} onSelect={() => setPlan('free')} />
            <PlanCard tier="pro" selected={plan === 'pro'} onSelect={() => setPlan('pro')} recommended />
          </VStack>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button
            label={step === 3 ? (submitting ? 'Registering…' : 'Register & open shop') : 'Continue'}
            onPress={() => (step === 3 ? submit() : setStep(step + 1))}
            fullWidth
            disabled={!canContinue || submitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, placeholder, keyboardType, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; keyboardType?: 'default' | 'phone-pad' | 'email-address'; multiline?: boolean;
}) {
  return (
    <VStack gap={1.5}>
      <Text variant="caption" style={{ fontWeight: '700' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.surface.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline === true && { minHeight: 70, textAlignVertical: 'top' }]}
      />
    </VStack>
  );
}

function PlanCard({
  tier, selected, onSelect, recommended,
}: {
  readonly tier: 'free' | 'pro';
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly recommended?: boolean;
}) {
  const isPro = tier === 'pro';
  return (
    <Pressable onPress={onSelect}>
      <Card
        padding={4}
        elevation="xs"
        bordered
        style={selected ? { borderColor: colors.brand[500], borderWidth: 2 } : undefined}
      >
        <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
          <VStack gap={0.5}>
            <Text variant="body" style={{ fontWeight: '700' }}>{isPro ? 'Pro' : 'Free'}</Text>
            <Text variant="caption" tone="secondary">
              {isPro ? 'Rs 499 / month - first 30 days free' : 'Always free'}
            </Text>
          </VStack>
          <HStack gap={2} align="center">
            {!!recommended && <Badge label="RECOMMENDED" tone="brand" />}
            {selected && (
              <View style={styles.selCheck}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </View>
            )}
          </HStack>
        </HStack>
        <VStack gap={1.5} style={{ marginTop: spacing[3] }}>
          <Feature ok text="Storefront profile + catalogue" />
          <Feature ok text="Post in neighborhood feed" />
          <Feature ok={isPro} text="Hyperlocal promotions / boosts" />
          <Feature ok={isPro} text="Analytics dashboard" />
          <Feature ok={isPro} text="Priority listing in Discover" />
        </VStack>
      </Card>
    </Pressable>
  );
}

function Feature({ ok, text }: { readonly ok: boolean; readonly text: string }) {
  return (
    <HStack gap={2} align="center">
      <View style={[styles.featDot, { backgroundColor: ok ? '#DCFCE7' : colors.gray[100] }]}>
        <Check size={11} color={ok ? '#16A34A' : colors.gray[400]} strokeWidth={3} />
      </View>
      <Text variant="caption" style={{ color: ok ? colors.surface.foreground : colors.surface.textSecondary }}>
        {text}
      </Text>
    </HStack>
  );
}

function TopBar({ onBack, title }: { readonly onBack: () => void; readonly title: string }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.iconBtn}>
        <ArrowLeft size={20} color={colors.surface.heading} />
      </Pressable>
      <Text variant="h3" style={{ fontWeight: '700' }}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
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
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catBtn: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    padding: spacing[1.5],
    position: 'relative',
  },
  catCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  chipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[1],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    fontSize: 15,
    color: colors.surface.foreground,
    backgroundColor: colors.surface.background,
  },
  featDot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  selCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    flexDirection: 'row',
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surface.border,
  },
  lockBox: {
    flex: 1,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
});
