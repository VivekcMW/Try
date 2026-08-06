import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { Button, Input, Screen, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { supabase } from '../../../lib/supabase';

export default function EmailLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.session) {
        throw new Error('Failed to create session');
      }

      // Success - navigate to main app
      router.replace('/(app)/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/splash')} 
          hitSlop={16} 
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
      </View>

      <VStack gap={6} style={styles.body}>
        <VStack gap={2}>
          <View style={styles.iconBubble}>
            <Mail size={22} color={colors.brand[600]} />
          </View>
          <Text variant="h2">Email Login</Text>
          <Text variant="body" tone="secondary">
            Development mode - Login with email & password
          </Text>
        </VStack>

        <VStack gap={4}>
          <VStack gap={2}>
            <Text variant="label" tone="secondary">
              Email
            </Text>
            <Input
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
            />
          </VStack>

          <VStack gap={2}>
            <Text variant="label" tone="secondary">
              Password
            </Text>
            <Input
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </VStack>

          {Boolean(error) && (
            <Text variant="body" style={{ color: colors.status.danger }}>
              {error}
            </Text>
          )}
        </VStack>
      </VStack>

      <VStack gap={3} style={styles.footer}>
        <Button 
          label={loading ? "Logging in..." : "Login"} 
          onPress={handleLogin} 
          disabled={!email || !password || loading} 
          fullWidth 
          size="lg" 
        />
        <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          Development mode only. Use phone login in production.
        </Text>
      </VStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.muted,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8],
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
});
