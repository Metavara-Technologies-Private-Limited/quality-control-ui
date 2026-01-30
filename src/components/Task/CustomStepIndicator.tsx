import { Box, Divider, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

interface CustomStepIndicatorProps {
  addTaskStep: number;
}

export const CustomStepIndicator: React.FC<CustomStepIndicatorProps> = ({
  addTaskStep,
}) => (
  <Box
    sx={{
      border: "1px solid #E2E8F0",
      borderRadius: "12px",
      bgcolor: "#FFFFFF",
      py: 1.5,
      px: 3,
      mt: 3,
      mb: 4,
      mx: 3,
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="center">
      <Stack direction="row" alignItems="center" spacing={1}>
        {addTaskStep > 1 ? (
          <CheckCircleRoundedIcon sx={{ color: "#4CAF50", fontSize: 24 }} />
        ) : (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: addTaskStep === 1 ? "#FF8A65" : "#E2E8F0",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            1
          </Box>
        )}
        <Typography
          sx={{
            color:
              addTaskStep >= 1
                ? addTaskStep === 1
                  ? "#FF8A65"
                  : "#4CAF50"
                : "#9CA3AF",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Event details
        </Typography>
      </Stack>
      <Divider sx={{ flex: 1, mx: 2, borderColor: "#E2E8F0" }} />
      <Stack direction="row" alignItems="center" spacing={1}>
        {addTaskStep > 2 ? (
          <CheckCircleRoundedIcon sx={{ color: "#4CAF50", fontSize: 24 }} />
        ) : (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: addTaskStep === 2 ? "#FF8A65" : "#E2E8F0",
              color: addTaskStep === 2 ? "#FFF" : "#9CA3AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            2
          </Box>
        )}
        <Typography
          sx={{
            color:
              addTaskStep >= 2
                ? addTaskStep === 2
                  ? "#FF8A65"
                  : "#4CAF50"
                : "#9CA3AF",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Description
        </Typography>
      </Stack>
      <Divider sx={{ flex: 1, mx: 2, borderColor: "#E2E8F0" }} />
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: addTaskStep === 3 ? "#FF8A65" : "#E2E8F0",
            color: addTaskStep === 3 ? "#FFF" : "#9CA3AF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          3
        </Box>
        <Typography
          sx={{
            color: addTaskStep === 3 ? "#FF8A65" : "#9CA3AF",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Sub Tasks
        </Typography>
      </Stack>
    </Stack>
  </Box>
);
