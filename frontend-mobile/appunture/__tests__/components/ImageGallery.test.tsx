import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ImageGallery from "../../components/ImageGallery";

describe("ImageGallery", () => {
  const images = ["https://example.com/a.jpg", "https://example.com/b.jpg"];

  it("renders carousel when images provided", () => {
    const { getByTestId } = render(<ImageGallery images={images} />);

    expect(getByTestId("image-gallery-carousel")).toBeTruthy();
  });

  it("shows add button when editable", () => {
    const onAddImage = jest.fn();
    const { getByTestId } = render(
      <ImageGallery images={images} editable onAddImage={onAddImage} />
    );

    fireEvent.press(getByTestId("add-image-floating-button"));
    expect(onAddImage).toHaveBeenCalledTimes(1);
  });

  it("fires delete callback when delete pressed", () => {
    const onDeleteImage = jest.fn();
    const { getByTestId } = render(
      <ImageGallery images={[images[0]]} editable onDeleteImage={onDeleteImage} />
    );

    fireEvent.press(getByTestId("delete-button-0"));
    expect(onDeleteImage).toHaveBeenCalledWith(0);
  });
});
