import { render, screen } from "@testing-library/react";
import Environment from "../pages/Quality_Control/QcLab/Embryology/Environment";

describe("Environment Page", () => {
  it("should show Clear and Save buttons", () => {
    render(<Environment />);

    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
