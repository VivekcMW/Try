/**
 * ErrorBoundary — catches React render errors and displays a fallback UI.
 * In production, also reports errors to your error tracking service.
 *
 * Usage:
 *   Wrap in _layout.tsx:
 *   <ErrorBoundary>
 *     <ThemeProvider value={...}>
 *       ...
 *     </ThemeProvider>
 *   </ErrorBoundary>
 */
import { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to your error tracking service in production
    // e.g., Sentry.captureException(error, { extra: errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo);

    // In production, send to error tracking
    if (__DEV__ === false) {
      this.reportError(error, errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // POST to your error logging endpoint
    const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
    fetch(`${BASE}/api/mobile/errors/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently ignore if error reporting fails
    });
  }

  private readonly handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <VStack gap={4} align="center">
            <View style={styles.iconWrapper}>
              <AlertTriangle size={48} color="#DC2626" />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We've encountered an unexpected error. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetail}>
                {this.state.error.message}
              </Text>
            )}
            <Pressable style={styles.button} onPress={this.handleRetry}>
              <RefreshCw size={18} color="#fff" />
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </VStack>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.background,
    padding: spacing[6],
  },
  iconWrapper: {
    backgroundColor: '#FEE2E2',
    borderRadius: 50,
    padding: spacing[4],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.surface.foreground,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.surface.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorDetail: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'monospace',
    backgroundColor: '#FEE2E2',
    padding: spacing[2],
    borderRadius: 4,
    maxWidth: 300,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: 8,
    marginTop: spacing[4],
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ErrorBoundary;
