import React, { useState } from 'react';
import { Image, ImageProps, StyleProp, ImageStyle } from 'react-native';

import { PlaceholderImage } from './PlaceholderImage';
import { resolveImageUri } from '../../utils/imageUri';

type SafeImageProps = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageProps['resizeMode'];
};

export function SafeImage({ uri, style, resizeMode }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedUri = resolveImageUri(uri);

  React.useEffect(() => {
    setFailed(false);
  }, [resolvedUri]);

  if (!resolvedUri || failed) return <PlaceholderImage style={style} />;

  return (
    <Image
      source={{ uri: resolvedUri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
