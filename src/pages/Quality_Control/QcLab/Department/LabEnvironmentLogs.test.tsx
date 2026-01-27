import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LabEnvironmentLogs from "./LabEnvironmentLogs";
import * as XLSX from "xlsx";

/* ---------------- MOCK API ---------------- */

vi.mock("@/services/api", () => ({
  environmentParameterValueApi: {
    listByParameter: vi.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          environment_parameter_id: 101,
          content: "25",
          log_time: new Date().toISOString(),
        },
      ],
    }),
    create: vi.fn(),
  },
}));

/* ---------------- MOCK DataGrid ---------------- */

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({ rows }: any) => (
    <div data-testid="datagrid">Rows: {rows.length}</div>
  ),
}));

/* ---------------- MOCK Import Dialog ---------------- */

vi.mock("./ImportCSVPopup", () => ({
  default: ({ open }: any) =>
    open ? <div data-testid="import-dialog">Import Dialog</div> : null,
}));

/* ---------------- MOCK XLSX ---------------- */

vi.mock("xlsx", async () => {
  const actual: any = await vi.importActual("xlsx");
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});

/* ---------------- TEST DATA ---------------- */

const mockEnvironment = {
  id: 1,
  parameters: [
    {
      id: 101,
      env_parameter_name: "Temperature",
      config: { unit: "°C" },
    },
  ],
};

describe("LabEnvironmentLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should filter logs based on search input", async () => {
    render(<LabEnvironmentLogs environment={mockEnvironment} />);

    await waitFor(() =>
      expect(screen.getByTestId("datagrid")).toBeInTheDocument()
    );

    const searchInput = screen.getByPlaceholderText(
      "Filter environment logs..."
    );

    fireEvent.change(searchInput, { target: { value: "temp" } });
    expect(searchInput).toHaveValue("temp");
  });

  it("should render DataGrid and handle pagination model", async () => {
    render(<LabEnvironmentLogs environment={mockEnvironment} />);

    await waitFor(() =>
      expect(screen.getByTestId("datagrid")).toHaveTextContent("Rows: 1")
    );
  });

  it("should open import dialog when Import CSV button is clicked", async () => {
    render(<LabEnvironmentLogs environment={mockEnvironment} />);

    await waitFor(() =>
      expect(screen.getByTestId("datagrid")).toBeInTheDocument()
    );

    const importButton = screen.getByRole("button", { name: /import csv/i });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByTestId("import-dialog")).toBeInTheDocument();
    });
  });

  it("should trigger Excel export on Export Excel click", async () => {
    render(<LabEnvironmentLogs environment={mockEnvironment} />);

    await waitFor(() =>
      expect(screen.getByTestId("datagrid")).toBeInTheDocument()
    );

    fireEvent.click(
      screen.getByRole("button", { name: /export excel/i })
    );

    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});