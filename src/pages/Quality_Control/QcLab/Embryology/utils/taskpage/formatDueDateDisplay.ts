import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { COLORS } from "./data/colors";

dayjs.extend(customParseFormat);

export const formatDueDateDisplay = (due: string) => {
  if (!due) return { text: "", color: "#111" };

  // Try parsing as ISO first
  let date = dayjs(due);
  
  // If invalid, try parsing as DD/MM/YYYY
  if (!date.isValid()) {
    date = dayjs(due, "DD/MM/YYYY", true); // strict parsing
  }

  if (!date.isValid()) return { text: due, color: "#111" };

  const today = dayjs().startOf("day");
  const tomorrow = today.add(1, "day");

  if (date.isSame(today)) return { text: "Today", color: COLORS.danger };
  if (date.isSame(tomorrow)) return { text: "Tomorrow", color: "#111" };

  return { text: date.format("DD MMM, YYYY"), color: "#111" };
};
