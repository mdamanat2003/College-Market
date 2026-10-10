import React, { useState } from 'react';
import { Image, ImageProps, StyleProp, ImageStyle, View, StyleSheet, ActivityIndicator } from 'react-native';

import { PlaceholderImage } from './PlaceholderImage';
import { resolveImageUri } from '../../utils/imageUri';

type SafeImageProps = {
  testID?: string;
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageProps['resizeMode'];
};

export function SafeImage({ testID, uri, style, resizeMode }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedUri = resolveImageUri(uri);

  React.useEffect(() => {
    setFailed(false);
    setIsLoading(true);
  }, [resolvedUri]);

  if (!resolvedUri || failed) return <PlaceholderImage style={style} />;

  return (
    <View style={[styles.container, style as any]}>
      <Image
        testID={testID}
        source={{ uri: resolvedUri }}
        style={[StyleSheet.absoluteFillObject, style, isLoading && styles.hiddenImg]}
        resizeMode={resizeMode}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setFailed(true);
        }}
      />
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color="#38BDF8" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#18181b',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenImg: {
    opacity: 0,
  },
});
