import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ImageGallery from "../../components/ImageGallery";
import type { GalleryImageSource } from "../../types/media";

jest.mock("react-native-svg", () => ({
  SvgUri: () => null,
}));

jest.mock("../../utils/bodyMap", () => ({
  getSvgAssetUriSync: jest.fn(() => "mock-svg"),
}));

// Mock Carousel to render all items synchronously for testing
jest.mock("react-native-reanimated-carousel", () => {
  const React = require("react");
  const { View, TouchableOpacity } = require("react-native");

  return {
    __esModule: true,
    default: React.forwardRef(
      ({ data, renderItem, testID, ...props }: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
          scrollTo: jest.fn(),
        }));
        return (
          <View testID={testID} {...props}>
            {data?.map((item: any, index: number) => (
              <View key={index}>{renderItem({ item, index })}</View>
            ))}
          </View>
        );
      }
    ),
  };
});

// Mock gesture handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  GestureDetector: ({ children }: any) => children,
  Gesture: {
    Pinch: () => ({
      onUpdate: () => ({
        onEnd: () => ({}),
      }),
    }),
  },
}));

// Mock reanimated
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    createAnimatedComponent: (Component: any) => Component,
    useSharedValue: (initial: any) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withSpring: (value: any) => value,
  };
});

const makeRemote = (id: string, remoteIndex: number): GalleryImageSource => ({
  id,
  type: "remote",
  uri: `https://example.com/${id}.jpg`,
  editable: true,
  remoteIndex,
});

const makeLocalSvg = (id: string): GalleryImageSource => ({
  id,
  type: "local-svg",
  asset: { uri: `${id}.svg` } as any,
  editable: false,
  label: `Atlas ${id}`,
});

describe("ImageGallery", () => {
  it("renders carousel when gallery sources are provided", () => {
    const images = [makeRemote("remote-1", 0), makeLocalSvg("atlas-1")];
    const { getByTestId } = render(<ImageGallery images={images} />);

    expect(getByTestId("image-gallery-carousel")).toBeTruthy();
  });

  it("does not render edit controls for local-only entries", () => {
    const images = [makeLocalSvg("atlas-only")];
    const { queryByTestId } = render(<ImageGallery images={images} editable />);

    expect(queryByTestId("delete-button-0")).toBeNull();
    expect(queryByTestId("move-left-0")).toBeNull();
  });

  it("fires delete callback with the remote index", () => {
    const onDeleteImage = jest.fn();
    const images = [makeRemote("remote-1", 0)];
    const { getByTestId } = render(
      <ImageGallery images={images} editable onDeleteImage={onDeleteImage} />
    );

    fireEvent.press(getByTestId("delete-button-0"));
    expect(onDeleteImage).toHaveBeenCalledWith(0);
  });

  it("reorders remote assets using remote indices", () => {
    const onReorder = jest.fn();
    const images = [makeRemote("remote-1", 0), makeRemote("remote-2", 1)];
    const { getAllByTestId } = render(
      <ImageGallery images={images} editable onReorder={onReorder} />
    );

    // Get all buttons by testID
    const moveLeftButtons = getAllByTestId(/^move-left-/);
    const moveRightButtons = getAllByTestId(/^move-right-/);

    // First item's move-left should be disabled (index 0)
    fireEvent.press(moveLeftButtons[0]);
    expect(onReorder).not.toHaveBeenCalled();

    // First item's move-right should work
    fireEvent.press(moveRightButtons[0]);
    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });

  it("shows empty-state add button when there are no images", () => {
    const onAddImage = jest.fn();
    const { getByTestId } = render(
      <ImageGallery images={[]} editable onAddImage={onAddImage} />
    );

    fireEvent.press(getByTestId("add-image-button"));
    expect(onAddImage).toHaveBeenCalledTimes(1);
  });

  it("renders floating add button when editable", () => {
    const onAddImage = jest.fn();
    const images = [makeRemote("remote-1", 0)];
    const { getByTestId } = render(
      <ImageGallery images={images} editable onAddImage={onAddImage} />
    );

    fireEvent.press(getByTestId("add-image-floating-button"));
    expect(onAddImage).toHaveBeenCalledTimes(1);
  });
});
