import React from 'react';
import { View, Text } from 'react-native';

const Carousel = React.forwardRef<any, any>(
  (
    { data = [], renderItem, testID, width, height, onSnapToItem }: any,
    ref
  ) => {
    const [index, setIndex] = React.useState(0);

    React.useImperativeHandle(ref, () => ({
      scrollTo: ({ index: nextIndex }: { index: number }) => {
        if (nextIndex >= 0 && nextIndex < data.length) {
          setIndex(nextIndex);
          onSnapToItem?.(nextIndex);
        }
      },
    }));

    if (!data.length) {
      return (
        <View testID={testID}>
          <Text>No items</Text>
        </View>
      );
    }

    return (
      <View testID={testID} style={{ width, height }}>
        {renderItem({ item: data[index], index })}
      </View>
    );
  }
);

export const ICarouselInstance = {} as any;

export default Carousel;
