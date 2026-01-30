import {
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

// AddEventDialog 
interface AddEventDialogProps {
  openAddEvent: boolean;
  setOpenAddEvent: (v: boolean) => void;
  newEventName: string;
  setNewEventName: (v: string) => void;
  eventError: string;
  setEventError: (v: string) => void;
  onCreate: (name: string) => void;
}

export const AddEventDialog = ({
  openAddEvent,
  setOpenAddEvent,
  newEventName,
  setNewEventName,
  eventError,
  setEventError,
  onCreate,
}: AddEventDialogProps) => {
  return (
    <div>
      {" "}
      <Dialog
        open={openAddEvent}
        onClose={() => setOpenAddEvent(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          pt={1}
        >
          <Typography fontSize={20} fontWeight={700}>
            Add New Event
          </Typography>
          <IconButton onClick={() => setOpenAddEvent(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            placeholder="Calibrate & Maintain Equipment"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            error={!!eventError}
            helperText={eventError}
          />
          <Stack direction="row" spacing={2} mt={3}>
            <Button
              fullWidth
              sx={{
                bgcolor: "#F3F4F6",
                color: "#111",
                borderRadius: "10px",
                height: 44,
              }}
              onClick={() => setOpenAddEvent(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              sx={{
                bgcolor: "#4B4B4B",
                color: "#FFF",
                borderRadius: "10px",
                height: 44,
                "&:hover": {
                  bgcolor: "#333333",
                  color: "#FFF",
                },
              }}
              onClick={() => {
                if (!newEventName.trim()) {
                  setEventError("Event name is required");
                  toast.error("Event name is required");
                  return;
                }

                onCreate(newEventName.trim());
                setNewEventName("");
                setEventError("");
                setOpenAddEvent(false);
                toast.success("Event created successfully");
              }}
            >
              Save
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </div>
  );
};
