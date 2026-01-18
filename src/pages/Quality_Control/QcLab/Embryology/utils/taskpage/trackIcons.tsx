import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box } from "@mui/material";
import { COLORS } from "./data/colors";

type TimerStatus = "IDLE" | "RUNNING" | "PAUSED" | "STOPPED";

type TimerHandlers = {
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
};

const noop = () => {};

export const trackIcons = (
  timerStatus: TimerStatus,
  handlers: TimerHandlers = {} // ✅ default
) => {
  const {
    onStart = noop,
    onPause = noop,
    onStop = noop,
  } = handlers;

  switch (timerStatus) {
    case "RUNNING":
      return (
        <>
          <PauseCircleFilledRoundedIcon
            sx={{ fontSize: 22, color: "#5B8DEF", cursor: "pointer" }}
            onClick={onPause}
          />
          <StopCircleRoundedIcon
            sx={{ fontSize: 22, color: "#D14343", cursor: "pointer" }}
            onClick={onStop}
          />
        </>
      );

    case "PAUSED":
      return (
        <>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              bgcolor: "#5B8DEF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={onStart}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />
          </Box>

          <StopCircleRoundedIcon
            sx={{ fontSize: 22, color: "#D14343", cursor: "pointer" }}
            onClick={onStop}
          />
        </>
      );

    case "STOPPED":
      return (
        <CheckCircleRoundedIcon
          sx={{ fontSize: 22, color: COLORS.complete }}
        />
      );

    case "IDLE":
    default:
      return (
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: "#5B8DEF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={onStart}
        >
          <PlayArrowRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />
        </Box>
      );
  }
};
