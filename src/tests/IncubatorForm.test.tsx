import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import IncubatorForm from "./IncubatorForm";
import { ToastContainer } from "react-toastify";

// ---- MOCK API ----
vi.mock("@/services/api", () => ({
  parameterValueApi: {
    create: vi.fn(() => Promise.resolve({})),
    listByParameter: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// ---- MOCK RECHARTS ----
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
  ReferenceLine: () => <div />,
  LabelList: () => <div />,
}));

describe("IncubatorForm - Save button & inputs", () => {
  const mockSetSelectedRadio = vi.fn();

  const mockEquipmentDetails = [
    {
      equipment_num: "INC-01",
      equipment_id: 1,
      make: "Test Make",
      model: "Test Model",
      parameters: [
        {
          id: 101,
          parameter_name: "Temperature",
          config: {},
        },
      ],
    },
  ];

  const renderForm = () =>
    render(
      <>
        <IncubatorForm
          selectedRadio="INC-01"
          setSelectedRadio={mockSetSelectedRadio}
          equipmentDetails={mockEquipmentDetails}
        />
        <ToastContainer />
      </>
    );

  it("renders Save and Clear buttons", () => {
    renderForm();

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("shows warning toast when Save is clicked with empty inputs", async () => {
    renderForm();

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(
        screen.getByText(/please fill at least one field/i)
      ).toBeInTheDocument();
    });
  });

  it("saves data when one input is filled", async () => {
    renderForm();

    const inputs = screen.getAllByPlaceholderText("Type Here");
    fireEvent.change(inputs[0], { target: { value: "37" } });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(
        screen.getAllByText(/parameter logs saved successfully/i).length
      ).toBeGreaterThan(0);
    });
  });
});
