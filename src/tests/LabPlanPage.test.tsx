import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LabPlanPage from "../pages/Quality_Control/QcLab/Department/LabPlanPage";

/* ================= MOCK ROUTER ================= */

vi.mock("react-router-dom", () => ({
  useOutletContext: () => ({
    departmentName: "Lab",
    selectedAssigneeIds: [],
    searchText: "",
  }),
}));

/* ================= MOCK REDUX ================= */

vi.mock("react-redux", () => ({
  useSelector: (fn: any) =>
    fn({
      clinic: {
        data: {
          department: [
            {
              name: "Lab",
              equipments: [
                {
                  equipment_details: [
                    {
                      id: 10,
                      equipment_num: "EQ-100",
                      make: "MakeA",
                      model: "ModelX",
                    },
                  ],
                  parameters: [],
                },
              ],
            },
          ],
        },
      },
      events: {
        data: [
          {
            id: 1,
            event_name: "Calibration",
            department: "Lab",
            assignment: "John Doe",
            schedule: { type: 1 },
            equipments: [
              {
                equipment_details__id: 10,
                equipment_details__equipment__equipment_name: "Microscope",
                equipment_details__equipment_num: "EQ-100",
              },
            ],
          },
        ],
      },
      assignees: {
        data: [{ id: 1, emp_name: "John Doe" }],
      },
    }),
}));

/* ================= MOCK RIGHT PANEL ================= */

vi.mock("./LabEquipmentForm", () => ({
  default: () => <div data-testid="equipment-form">Equipment Form</div>,
}));

/* ================= TESTS ================= */

describe("LabPlanPage", () => {
  it("renders schedule tabs", () => {
    render(<LabPlanPage />);

    expect(screen.getByText("One Time")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();
  });

  it("shows equipment card under One Time tab", () => {
    render(<LabPlanPage />);

    expect(screen.getByText("EQ-100")).toBeInTheDocument();
    expect(screen.getByText("Microscope")).toBeInTheDocument();
    expect(screen.getByText("Calibration")).toBeInTheDocument();
  });

  it("selects equipment and opens right panel", () => {
    render(<LabPlanPage />);

    fireEvent.click(screen.getByText("EQ-100"));

    expect(screen.getByTestId("equipment-form")).toBeInTheDocument();
  });

  it("switching tabs clears selected item", () => {
    render(<LabPlanPage />);

    fireEvent.click(screen.getByText("EQ-100"));
    expect(screen.getByTestId("equipment-form")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Daily"));
    expect(screen.queryByTestId("equipment-form")).not.toBeInTheDocument();
  });

  it("shows no plans when tab has no items", () => {
    render(<LabPlanPage />);

    fireEvent.click(screen.getByText("Weekly"));
    expect(screen.getByText("No plans found")).toBeInTheDocument();
  });
});