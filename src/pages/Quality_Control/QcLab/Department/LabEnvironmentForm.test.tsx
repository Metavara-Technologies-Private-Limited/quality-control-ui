import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LabEnvironmentForm from "./LabEnvironmentForm";
import { environmentParameterValueApi } from "@/services/api";

/* ---------------- MOCK CHILD COMPONENTS ---------------- */

// Mock Logs (avoid MUI DataGrid)
vi.mock("./LabEnvironmentLogs", () => ({
  default: () => <div>Mocked Logs Component</div>,
}));

// Mock ParameterInput 
vi.mock("./components/ParameterInput", () => ({
  default: ({ parameter, onChange }: any) => {
    return (
      <div>
        <span>{parameter.env_parameter_name}</span>
        <button onClick={() => onChange("20")}>Set Value</button>
      </div>
    );
  },
}));

/* ---------------- MOCK API ---------------- */

vi.mock("@/services/api", () => ({
  environmentParameterValueApi: {
    create: vi.fn(),
  },
}));

/* ---------------- MOCK MUI DATE PICKER ---------------- */

vi.mock("@mui/x-date-pickers/AdapterDayjs", () => ({
  AdapterDayjs: class {},
}));

vi.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@mui/x-date-pickers/DateTimePicker", () => ({
  DateTimePicker: ({ label }: any) => (
    <input aria-label={label} data-testid="datetime-picker" />
  ),
}));

/* ---------------- TESTS ---------------- */

describe("LabEnvironmentForm", () => {
  const mockOnSaved = vi.fn();

  const mockEnvironment = {
    id: 1,
    environment_name: "Test Environment",
    parameters: [
      {
        id: 101,
        env_parameter_name: "Temperature",
        is_active: true,
        is_deleted: false,
        config: {
          min_value: 10,
          max_value: 40,
          unit: "°C",
          default_value: 25,
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  //  TEST 1
  it("should render Clear and Save buttons", () => {
    render(
      <LabEnvironmentForm
        environment={mockEnvironment}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  //  TEST 2 
  it("should render parameter name", () => {
    render(
      <LabEnvironmentForm
        environment={mockEnvironment}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText(/Range:/i)).toBeInTheDocument();
  });

  //  TEST 3 
  it("should call API and onSaved when Save is clicked", async () => {
    (environmentParameterValueApi.create as any).mockResolvedValue({});

    render(
      <LabEnvironmentForm
        environment={mockEnvironment}
        onSaved={mockOnSaved}
      />
    );

    //  set parameter value
    fireEvent.click(screen.getByText("Set Value"));

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(environmentParameterValueApi.create).toHaveBeenCalled();
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });
});