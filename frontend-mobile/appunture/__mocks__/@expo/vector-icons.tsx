import React from "react";
import { Text } from "react-native";

type IconProps = {
  name?: string;
  size?: number;
  color?: string;
  testID?: string;
};

const IconStub: React.FC<IconProps> = ({ name = "icon", testID }) => (
  <Text testID={testID}>{name}</Text>
);

export const Ionicons = IconStub;
export const MaterialIcons = IconStub;
export const FontAwesome = IconStub;
export default {
  Ionicons: IconStub,
  MaterialIcons: IconStub,
  FontAwesome: IconStub,
};
