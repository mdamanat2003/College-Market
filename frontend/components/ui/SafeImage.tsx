import React, { useState } from 'react';
import { Image, ImageProps, StyleProp, ImageStyle } from 'react-native';
import { PlaceholderImage } from './PlaceholderImage';

type SafeImageProps = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageProps['resizeMode'];
};

export function SafeImage({ uri, style, resizeMode }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) return <PlaceholderImage style={style} />;

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
