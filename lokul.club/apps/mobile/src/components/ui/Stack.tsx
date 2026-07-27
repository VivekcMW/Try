import type { ReactNode } from 'react';
import { View, type ViewStyle, type ViewProps } from 'react-native';
import { spacing, type SpacingKey } from '@lokul/ui-tokens';

type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface BaseStackProps extends ViewProps {
  children: ReactNode;
  gap?: SpacingKey;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  flex?: number;
  style?: ViewStyle;
}

const alignMap: Record<Align, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const justifyMap: Record<Justify, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

function makeStack(direction: 'row' | 'column') {
  return function Stack({
    children,
    gap = 0,
    align,
    justify,
    wrap,
    flex,
    style,
    ...rest
  }: BaseStackProps) {
    const composed: ViewStyle = {
      flexDirection: direction,
      gap: spacing[gap],
      alignItems: align ? alignMap[align] : undefined,
      justifyContent: justify ? justifyMap[justify] : undefined,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      flex,
    };
    return (
      <View {...rest} style={[composed, style]}>
        {children}
      </View>
    );
  };
}

export const VStack = makeStack('column');
export const HStack = makeStack('row');

export type StackProps = BaseStackProps;
