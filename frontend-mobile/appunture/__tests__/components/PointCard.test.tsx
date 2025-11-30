import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PointCard from "../../components/PointCard";
import { Point } from "../../types/api";

// Mock expo-router
jest.mock("expo-router", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <>{children}</>
  ),
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({
    name,
    size,
    color,
  }: {
    name: string;
    size: number;
    color: string;
  }) => null,
}));

const createMockPoint = (overrides?: Partial<Point>): Point => ({
  id: "point-1",
  name: "Zhongfu",
  code: "LU-1",
  meridian: "Lung",
  location: "On the lateral aspect of the chest",
  chinese_name: "中府",
  indications: "Cough, asthma, chest pain",
  isFavorite: false,
  ...overrides,
});

describe("PointCard", () => {
  const defaultProps = {
    point: createMockPoint(),
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render point name correctly", () => {
      const { getByText } = render(<PointCard {...defaultProps} />);

      expect(getByText("Zhongfu")).toBeTruthy();
    });

    it("should render chinese name when provided", () => {
      const { getByText } = render(<PointCard {...defaultProps} />);

      expect(getByText("(中府)")).toBeTruthy();
    });

    it("should render meridian name", () => {
      const { getByText } = render(<PointCard {...defaultProps} />);

      expect(getByText("Lung")).toBeTruthy();
    });

    it("should render location text", () => {
      const { getByText } = render(<PointCard {...defaultProps} />);

      expect(getByText("On the lateral aspect of the chest")).toBeTruthy();
    });

    it("should render indications when provided", () => {
      const { getByText } = render(<PointCard {...defaultProps} />);

      expect(getByText(/Indicações:/)).toBeTruthy();
    });

    it("should not render indications when not provided", () => {
      const point = createMockPoint({ indications: undefined });
      const { queryByText } = render(
        <PointCard {...defaultProps} point={point} />
      );

      expect(queryByText(/Indicações:/)).toBeNull();
    });

    it("should not render chinese name when not provided", () => {
      const point = createMockPoint({ chinese_name: undefined });
      const { queryByText } = render(
        <PointCard {...defaultProps} point={point} />
      );

      expect(queryByText("(中府)")).toBeNull();
    });
  });

  describe("Favorite Button", () => {
    it("should not show favorite button when showFavoriteButton is false", () => {
      const { queryByLabelText } = render(
        <PointCard {...defaultProps} showFavoriteButton={false} />
      );

      expect(queryByLabelText(/favoritos/)).toBeNull();
    });

    it("should show favorite button when showFavoriteButton is true and onToggleFavorite provided", () => {
      const onToggleFavorite = jest.fn();
      const { getByLabelText } = render(
        <PointCard
          {...defaultProps}
          showFavoriteButton={true}
          onToggleFavorite={onToggleFavorite}
        />
      );

      expect(getByLabelText("Adicionar aos favoritos")).toBeTruthy();
    });

    it("should show remove from favorites label when isFavorite is true", () => {
      const onToggleFavorite = jest.fn();
      const { getByLabelText } = render(
        <PointCard
          {...defaultProps}
          showFavoriteButton={true}
          isFavorite={true}
          onToggleFavorite={onToggleFavorite}
        />
      );

      expect(getByLabelText("Remover dos favoritos")).toBeTruthy();
    });

    it("should call onToggleFavorite when favorite button is pressed", () => {
      const onToggleFavorite = jest.fn();
      const { getByLabelText } = render(
        <PointCard
          {...defaultProps}
          showFavoriteButton={true}
          onToggleFavorite={onToggleFavorite}
        />
      );

      // fireEvent.press passes the event to the handler
      // The component expects stopPropagation to exist
      fireEvent.press(getByLabelText("Adicionar aos favoritos"), {
        stopPropagation: jest.fn(),
      });

      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    });
  });

  describe("Press Event", () => {
    it("should call onPress when card is pressed", () => {
      const onPress = jest.fn();
      const { getByLabelText } = render(
        <PointCard {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByLabelText(/Ponto Zhongfu/));

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have correct accessibility role", () => {
      const { getByRole } = render(<PointCard {...defaultProps} />);

      expect(getByRole("button")).toBeTruthy();
    });

    it("should have accessible label with point information", () => {
      const { getByLabelText } = render(<PointCard {...defaultProps} />);

      const button = getByLabelText(/Ponto Zhongfu/);
      expect(button).toBeTruthy();
    });
  });

  describe("Memoization", () => {
    it("should render correctly on initial render", () => {
      const { toJSON } = render(<PointCard {...defaultProps} />);

      expect(toJSON()).toBeTruthy();
    });

    it("should maintain structure with different point data", () => {
      const point1 = createMockPoint({ id: "point-1", name: "Point 1" });
      const point2 = createMockPoint({ id: "point-2", name: "Point 2" });

      const { rerender, getByText } = render(
        <PointCard {...defaultProps} point={point1} />
      );
      expect(getByText("Point 1")).toBeTruthy();

      rerender(<PointCard {...defaultProps} point={point2} />);
      expect(getByText("Point 2")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle long location text", () => {
      const longLocation = "A".repeat(200);
      const point = createMockPoint({ location: longLocation });
      const { toJSON } = render(<PointCard {...defaultProps} point={point} />);

      expect(toJSON()).toBeTruthy();
    });

    it("should handle long indications text", () => {
      const longIndications = "B".repeat(200);
      const point = createMockPoint({ indications: longIndications });
      const { toJSON } = render(<PointCard {...defaultProps} point={point} />);

      expect(toJSON()).toBeTruthy();
    });

    it("should handle missing optional props", () => {
      const point = createMockPoint({
        chinese_name: undefined,
        indications: undefined,
      });
      const { toJSON } = render(<PointCard {...defaultProps} point={point} />);

      expect(toJSON()).toBeTruthy();
    });
  });
});
