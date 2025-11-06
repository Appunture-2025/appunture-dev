import ReanimatedMock = require('react-native-reanimated/mock');

const Reanimated = ReanimatedMock as any;

// The mock adds a default export of `undefined`, so we add our own for compatibility.
Reanimated.createAnimatedComponent = (component: any) => component;
Reanimated.useSharedValue = (initial: any) => ({ value: initial });
Reanimated.useAnimatedGestureHandler = () => jest.fn();
Reanimated.useAnimatedStyle = (styleCreator: () => any) => styleCreator();
Reanimated.runOnJS = (fn: (...args: any[]) => any) => fn;
Reanimated.default = Reanimated;

export = Reanimated;
