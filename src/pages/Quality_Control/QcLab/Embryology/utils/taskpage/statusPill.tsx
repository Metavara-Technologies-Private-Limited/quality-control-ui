import { Box, Divider, Stack, Typography } from "@mui/material";
import { COLORS } from "./data/colors";
import PlayArrowRounded  from "@mui/icons-material/PlayArrowRounded";

 export const statusPill = (status: string, onIconClick?: (event: React.MouseEvent<HTMLElement>) => void) => {
    const bg =
      status === "Completed"
        ? COLORS.complete
        : status === "In Progress"
        ? COLORS.progress
        : COLORS.todo;

    return (
      <Box
       sx={{ display: "inline-flex", alignItems: "center", height: 22, borderRadius: 8, bgcolor: bg, color: "#fff", overflow: "hidden" }}>
        <Typography sx={{ px: 1.2, fontSize: 12, fontWeight: 500 }}>
          {status}
        </Typography>
        <Box
          sx={{
            width: 14,
            minWidth: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: "1px solid rgba(255,255,255,0.35)",
            cursor: onIconClick ? "pointer" : "default"
          }}
          onClick={onIconClick ? (e) => {
            e.stopPropagation();
            onIconClick(e);
          } : undefined}
        >
          <PlayArrowRounded sx={{ fontSize: 9, color: "#fff" }} />
        </Box>
      </Box>
    );
  };