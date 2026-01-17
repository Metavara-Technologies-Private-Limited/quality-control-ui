import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Events from "./Events";

/* ---------------- MOCK react-redux ---------------- */
vi.mock("react-redux", async () => {
  const actual: any = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => vi.fn(),
    useSelector: (selector: any) =>
      selector({
        clinic: { data: { id: 1 } },
        events: {
          loading: false,
        },
        uiEvents: [
          {
            id: 1,
            name: "Test Event",
            createdBy: "Admin",
            createdDate: "01/01/2024",
            scheduleType: "One Time",
            equipmentCount: 2,
            parameterCount: 4,
          },
        ],
      }),
  };
});

/* ---------------- MOCK event slice ---------------- */
vi.mock("@/store/eventSlice", () => ({
  fetchEventsByClinic: vi.fn(),
  selectUIEvents: () => [
    {
      id: 1,
      name: "Test Event",
      createdBy: "Admin",
      createdDate: "01/01/2024",
      scheduleType: "One Time",
      equipmentCount: 2,
      parameterCount: 4,
    },
  ],
}));

/* ---------------- TESTS ---------------- */
describe("Events Page", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Events />
      </BrowserRouter>
    );
  });

  it("renders Events heading", () => {
    expect(screen.getByText("Events")).toBeInTheDocument();
  });

  it("renders search input", () => {
    expect(
      screen.getByPlaceholderText("Search Events")
    ).toBeInTheDocument();
  });

  it("renders Create Event button", () => {
    expect(screen.getByText("Create Event")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    expect(screen.getByText("Event Name")).toBeInTheDocument();
    expect(screen.getByText("Created By")).toBeInTheDocument();
    expect(screen.getByText("Created Date")).toBeInTheDocument();
    expect(screen.getByText("Schedule On")).toBeInTheDocument();
    expect(screen.getByText("Total No Equipment")).toBeInTheDocument();
    expect(screen.getByText("Total No Parameters")).toBeInTheDocument();
  });

  it("renders table footer text", () => {
    expect(
      screen.getByText(/showing/i)
    ).toBeInTheDocument();
  });
});
