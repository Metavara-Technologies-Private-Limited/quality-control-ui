import dayjs from "dayjs";
import { COLORS } from "./data/colors";

 export const formatDueDateDisplay = (due: string) => {
    if (!due) return { text: "", color: "#111" };
    const date = dayjs(due);
    if (!date.isValid()) return { text: due, color: "#111" };
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');
    if (date.isSame(today)) return { text: "Today", color: COLORS.danger };
    if (date.isSame(tomorrow)) return { text: "Tomorrow", color: COLORS.tomorrow };
    return { text: date.format("DD MMM, YYYY"), color: "#111" };
  };