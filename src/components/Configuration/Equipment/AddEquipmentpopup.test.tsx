import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AddEquipmentPopup from "./AddEquipmentPopup";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

// ---- MOCK navigate ----
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual, 
    useNavigate: () => mockNavigate,
  };
});

// ---- MOCK REDUX STORE ----
const mockStore = configureStore({
  reducer: {
    clinic: () => ({
      data: {
        department: [
          { id: 1, name: "Embryology", is_active: true },
          { id: 2, name: "Andrology", is_active: false },
        ],
      },
    }),
  },
});

const renderPopup = (open = true, onClose = vi.fn()) =>
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <AddEquipmentPopup open={open} onClose={onClose} />
      </MemoryRouter>
    </Provider>
  );

describe("AddEquipmentPopup", () => {
  it("renders Add button and Cancel button", () => {
    renderPopup();

    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("Add button is disabled when fields are empty", () => {
    renderPopup();

    expect(screen.getByText("Add")).toBeDisabled();
  });

  it("enables Add button when equipment name and department are selected", () => {
    renderPopup();

    fireEvent.change(screen.getByLabelText(/equipment name/i), {
      target: { value: "Incubator" },
    });

    fireEvent.mouseDown(screen.getByLabelText(/department/i));
    fireEvent.click(screen.getByText("Embryology"));

    expect(screen.getByText("Add")).not.toBeDisabled();
  });

  it("navigates to add-parameter page when Add is clicked", () => {
    const onClose = vi.fn();
    renderPopup(true, onClose);

    fireEvent.change(screen.getByLabelText(/equipment name/i), {
      target: { value: "Incubator" },
    });

    fireEvent.mouseDown(screen.getByLabelText(/department/i));
    fireEvent.click(screen.getByText("Embryology"));

    fireEvent.click(screen.getByText("Add"));

    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      "/configuration/equipment/add-parameter",
      expect.objectContaining({
        state: expect.objectContaining({
          equipmentName: "Incubator",
          departmentName: "Embryology",
        }),
      })
    );
  });
});
