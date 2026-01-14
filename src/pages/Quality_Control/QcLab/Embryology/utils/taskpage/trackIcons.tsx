import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import PlayArrowRounded  from "@mui/icons-material/PlayArrowRounded";
import { Box } from "@mui/material";
import { COLORS } from "./data/colors";

export const trackIcons = (status: string) => {
    if (status === "In Progress") {
      return (
        <>
          <PauseCircleFilledRoundedIcon sx={{ fontSize: 22, color: "#5B8DEF" }} />
          <StopCircleRoundedIcon sx={{ fontSize: 22, color: "#D14343" }} />
        </>
      );
    }
    if (status === "Completed") {
      return <CheckCircleRoundedIcon sx={{ fontSize: 22, color: COLORS.complete }} />;
    }
    return (
      <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#5B8DEF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PlayArrowRounded sx={{ fontSize: 11, color: "#fff" }} />
      </Box>
    );
  };