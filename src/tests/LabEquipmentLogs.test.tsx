import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import LabEquipmentLogs from "../pages/Quality_Control/QcLab/Department/LabEquipmentLogs";
import * as XLSX from "xlsx";

/* ================= HOISTED MOCKS ================= */

const apiMocks = vi.hoisted(() => ({
  listByParameter: vi.fn(),
  create: vi.fn(),
}));

/* ================= MOCK REDUX ================= */

vi.mock("react-redux", () => ({
  useSelector: (fn: any) =>
    fn({
      clinic: {
        data: {
          department: [
            {
              equipments: [
                {
                  equipment_details: [
                    { id: 10, equipment_num: "EQ-100" },
                  ],
                },
              ],
            },
          ],
        },
      },
    }),
}));

/* ================= MOCK API ================= */

vi.mock("@/services/api", () => ({
  parameterValueApi: {
    listByParameter: apiMocks.listByParameter,
    create: apiMocks.create,
  },
}));

/* ================= MOCK DATAGRID ================= */

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({ rows }: any) => (
    <div data-testid="datagrid">
      {rows.map((r: any) => (
        <div key={r.id} data-testid="row">
          {r.parameter}-{r.value}
        </div>
      ))}
    </div>
  ),
}));

/* ================= MOCK IMPORT POPUP ================= */

vi.mock("./ImportCSVPopup", () => ({
  default: ({ open, onImport }: any) =>
    open ? (
      <button
        data-testid="import-popup"
        onClick={() =>
          onImport([
            {
              parameter: "Temperature",
              value: "25",
              dateTime: "2024-01-01 10:00",
            },
          ])
        }
      >
        Import Popup
      </button>
    ) : null,
}));

/* ================= MOCK TOAST ================= */

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

/* ================= MOCK XLSX ================= */

vi.mock("xlsx", async () => {
  const actual: any = await vi.importActual("xlsx");
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});

/* ================= TEST DATA ================= */

const equipment = {
  equipment_num: "EQ-100",
  equipment_id: 10,
  parameters: [
    {
      id: 1,
      parameter_name: "Temperature",
      config: { unit: "°C" },
    },
  ],
};

/* ================= TESTS ================= */

describe("LabEquipmentLogs UI behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input and buttons after loading", async () => {
    apiMocks.listByParameter.mockResolvedValue({ data: [] });

    render(<LabEquipmentLogs equipment={equipment} />);

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar")
    );

    expect(
      screen.getByPlaceholderText("Search across all columns...")
    ).toBeInTheDocument();

    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.getByText("Import CSV")).toBeInTheDocument();
    expect(screen.getByTestId("datagrid")).toBeInTheDocument();
  });

  it("filters rows when searching", async () => {
    apiMocks.listByParameter.mockResolvedValue({
      data: [
        {
          id: 1,
          created_at: "2024-01-01",
          equipment_details_id: 10,
          parameter_id: 1,
          content: "25",
        },
      ],
    });

    render(<LabEquipmentLogs equipment={equipment} />);

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar")
    );

    expect(screen.getByTestId("row")).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("Search across all columns..."),
      { target: { value: "xyz" } }
    );

    expect(screen.queryByTestId("row")).not.toBeInTheDocument();
  });

  it("exports Excel when Export CSV is clicked", async () => {
    apiMocks.listByParameter.mockResolvedValue({
      data: [
        {
          id: 1,
          created_at: "2024-01-01",
          equipment_details_id: 10,
          parameter_id: 1,
          content: "25",
        },
      ],
    });

    render(<LabEquipmentLogs equipment={equipment} />);

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar")
    );

    fireEvent.click(screen.getByText("Export CSV"));

    expect(XLSX.writeFile).toHaveBeenCalled();
  });

  it("opens import dialog and saves logs", async () => {
    apiMocks.listByParameter.mockResolvedValue({ data: [] });
    apiMocks.create.mockResolvedValue({});

    render(<LabEquipmentLogs equipment={equipment} />);

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar")
    );

    fireEvent.click(screen.getByText("Import CSV"));

    await waitFor(() =>
      expect(screen.getByTestId("import-popup")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("import-popup"));

    await waitFor(() =>
      expect(apiMocks.create).toHaveBeenCalled()
    );
  });
});