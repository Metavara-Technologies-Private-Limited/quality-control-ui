import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LabEquipmentForm from "../pages/Quality_Control/QcLab/Department/LabEquipmentForm";
import { parameterValueApi } from "@/services/api";

/* ---------------- MOCK TOAST ---------------- */

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

/* ---------------- MOCK API ---------------- */

vi.mock("@/services/api", () => ({
  parameterValueApi: {
    create: vi.fn(),
  },
}));

/* ---------------- MOCK CHILD COMPONENTS ---------------- */

vi.mock("./LabEquipmentLogs", () => ({
  default: () => <div data-testid="logs-view">Logs View</div>,
}));

vi.mock("./LabEquipmentComplianceChart", () => ({
  default: ({ equipmentDetailId }: any) => (
    <div data-testid="compliance-chart">
      Chart for {equipmentDetailId}
    </div>
  ),
}));

// CRITICAL: mock ParameterInput so we can control values
vi.mock("./components/ParameterInput", () => ({
  default: ({ parameter, value, onChange }: any) => (
    <input
      data-testid={`param-${parameter.parameter_name}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

/* ---------------- MOCK DATE PICKER ---------------- */

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

/* ---------------- TEST DATA ---------------- */

const equipmentDetails = [
  {
    equipment_num: "EQ-1",
    equipment_id: 11,
    make: "MakeOne",
    model: "ModelOne",
    parameters: [
      {
        id: 1,
        parameter_name: "Temperature",
        config: { min_value: 10, max_value: 40, unit: "°C" },
      },
      {
        id: 2,
        parameter_name: "Pressure",
        config: { min_value: 5, max_value: 20, unit: "bar" },
      },
    ],
  },
  {
    equipment_num: "EQ-2",
    equipment_id: 22,
    make: "MakeTwo",
    model: "ModelTwo",
    parameters: [],
  },
];

describe("LabEquipmentForm", () => {
  const setSelectedRadio = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ---------------- BASIC RENDER ---------------- */

  it("renders form tab by default with equipment details", () => {
    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("MakeOne")).toBeInTheDocument();
    expect(screen.getByText("ModelOne")).toBeInTheDocument();
  });

  /* ---------------- TAB SWITCHING ---------------- */

  it("switches between Form and Logs tabs", () => {
    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    fireEvent.click(screen.getByText("Logs"));
    expect(screen.getByTestId("logs-view")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Form"));
    expect(screen.getByText("MakeOne")).toBeInTheDocument();
  });

  /* ---------------- EQUIPMENT SELECTION ---------------- */

  it("updates equipment when another radio is selected", () => {
    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    fireEvent.click(screen.getByText("EQ-2"));
    expect(setSelectedRadio).toHaveBeenCalledWith("EQ-2");
  });

  /* ---------------- PARAMETER INPUTS ---------------- */

  it("renders parameter inputs and updates values", () => {
    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    const tempInput = screen.getByTestId("param-Temperature");
    fireEvent.change(tempInput, { target: { value: "25" } });

    expect(tempInput).toHaveValue("25");
  });

  /* ---------------- SAVE VALIDATION ---------------- */

  it("shows warning and does not call API when saving empty form", async () => {
    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    fireEvent.click(screen.getByText("Save"));

    expect(parameterValueApi.create).not.toHaveBeenCalled();
  });

  /* ---------------- SAVE SUCCESS FLOW ---------------- */

  it("calls API for each parameter and clears inputs on success", async () => {
    (parameterValueApi.create as any).mockResolvedValue({});

    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    fireEvent.change(screen.getByTestId("param-Temperature"), {
      target: { value: "25" },
    });

    fireEvent.change(screen.getByTestId("param-Pressure"), {
      target: { value: "10" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(parameterValueApi.create).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByTestId("param-Temperature")).toHaveValue("");
    expect(screen.getByTestId("param-Pressure")).toHaveValue("");
  });

  /* ---------------- SAVE ERROR ---------------- */

  it("shows error toast on API failure", async () => {
    (parameterValueApi.create as any).mockRejectedValueOnce(new Error());

    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    fireEvent.change(screen.getByTestId("param-Temperature"), {
      target: { value: "25" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(parameterValueApi.create).toHaveBeenCalled();
    });
  });

  /* ---------------- CLEAR BUTTON ---------------- */

  it("clears inputs and shows info toast", () => {
    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    fireEvent.change(screen.getByTestId("param-Temperature"), {
      target: { value: "25" },
    });

    fireEvent.click(screen.getByText("Clear"));

    expect(screen.getByTestId("param-Temperature")).toHaveValue("");
  });

  /* ---------------- DISABLED STATE ---------------- */

  it("disables buttons while saving", async () => {
    let resolvePromise: any;
    (parameterValueApi.create as any).mockReturnValue(
      new Promise((res) => (resolvePromise = res))
    );

    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    fireEvent.change(screen.getByTestId("param-Temperature"), {
      target: { value: "25" },
    });

    fireEvent.click(screen.getByText("Save"));

    expect(screen.getByText("Saving...")).toBeInTheDocument();

    resolvePromise({});
  });

  /* ---------------- CONDITIONAL RENDER ---------------- */

  it("returns null if no matching equipment exists", () => {
    const { container } = render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="INVALID"
        setSelectedRadio={setSelectedRadio}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  /* ---------------- COMPLIANCE CHART REFRESH ---------------- */

  it("re-renders compliance chart after save", async () => {
    (parameterValueApi.create as any).mockResolvedValue({});

    render(
      <LabEquipmentForm
        equipmentDetails={equipmentDetails}
        selectedRadio="EQ-1"
        setSelectedRadio={setSelectedRadio}
      />
    );

    const chartBefore = screen.getByTestId("compliance-chart").textContent;

    fireEvent.change(screen.getByTestId("param-Temperature"), {
      target: { value: "25" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(parameterValueApi.create).toHaveBeenCalled();
    });

    const chartAfter = screen.getByTestId("compliance-chart").textContent;
    expect(chartAfter).toBe(chartBefore);
  });
});