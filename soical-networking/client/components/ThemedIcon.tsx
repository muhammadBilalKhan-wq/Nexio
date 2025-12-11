import React from 'react';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Feather,
  Ionicons,
  Entypo,
  SimpleLineIcons,
  Octicons,
  Fontisto,
} from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const iconSets = {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Feather,
  Ionicons,
  Entypo,
  SimpleLineIcons,
  Octicons,
  Fontisto,
};

type IconProps = {
  set: keyof typeof iconSets;
  name: any;
  size?: number;
  color?: string;
  style?: any;
};

export function ThemedIcon({ set, name, size = 24, color, style }: IconProps) {
  const { theme } = useTheme();
  const IconComponent = iconSets[set];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      name={name}
      size={size}
      color={color || theme.icon}
      style={style}
    />
  );
}
