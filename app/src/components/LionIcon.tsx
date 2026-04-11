import Svg, { Polygon, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function LionIcon({ size = 22, color = '#2D7A3A' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Mane — 8-pointed gentle star */}
      <Polygon
        points="12,2 14.9,5.1 19.1,4.9 18.9,9.1 22,12 18.9,14.9 19.1,19.1 14.9,18.9 12,22 9.1,18.9 4.9,19.1 5.1,14.9 2,12 5.1,9.1 4.9,4.9 9.1,5.1"
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={0.7}
        strokeOpacity={0.5}
      />
      {/* Face */}
      <Circle cx="12" cy="12" r="5.4" fill={color} />
      {/* Eyes */}
      <Circle cx="10.5" cy="11" r="0.9" fill="white" />
      <Circle cx="13.5" cy="11" r="0.9" fill="white" />
      {/* Nose */}
      <Circle cx="12" cy="13.3" r="0.75" fill="white" fillOpacity={0.9} />
    </Svg>
  );
}
