import { useMemo, useState } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius } from '@lokul/ui-tokens';
import { Text } from './Text';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: Size;
  style?: ViewStyle;
}

const sizeMap: Record<Size, { box: number; font: number }> = {
  xs: { box: 24, font: 10 },
  sm: { box: 32, font: 12 },
  md: { box: 40, font: 14 },
  lg: { box: 56, font: 20 },
  xl: { box: 80, font: 28 },
};

function initialsFor(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

// Pick a stable color from the name hash for the fallback bg.
const palette = [
  colors.brand[500],
  colors.accent[500],
  colors.semantic.info,
  colors.semantic.success,
  colors.brand[700],
];
function colorFor(name?: string) {
  if (!name) return colors.gray[400];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length]!;
}

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const { box, font } = sizeMap[size];
  const bg = useMemo(() => colorFor(name), [name]);

  const showImage = source && !errored;

  return (
    <View
      style={[
        styles.container,
        {
          width: box,
          height: box,
          borderRadius: box / 2,
          backgroundColor: showImage ? colors.gray[100] : bg,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={source}
          onError={() => setErrored(true)}
          style={{ width: box, height: box, borderRadius: box / 2 }}
        />
      ) : (
        <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: font }}>
          {initialsFor(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.full,
  },
});

export default Avatar;
