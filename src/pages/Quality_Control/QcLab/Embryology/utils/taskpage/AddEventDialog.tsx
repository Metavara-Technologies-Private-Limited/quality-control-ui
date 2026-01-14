import { Button, Dialog, DialogContent, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


interface AddEventDialogProps {
    openAddEvent: boolean;
    setOpenAddEvent: (open: boolean) => void;   
    newEventName: string;
    setNewEventName: (name: string) => void;
    eventError: string;
    setEventError: (error: string) => void;
    setEvents: (events: any[]) => void;
    setTasksByEvent: (tasksByEvent: any) => void;
    setSelectedEvent: (event: string) => void;
}

export const AddEventDialog = ({ openAddEvent, setOpenAddEvent, newEventName, setNewEventName, eventError, setEventError, setEvents, setTasksByEvent, setSelectedEvent }) => {
    return (
    
        <div> <Dialog open={openAddEvent} onClose={() => setOpenAddEvent(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} pt={1}>
            <Typography fontSize={20} fontWeight={700}>Add New Event</Typography>
            <IconButton onClick={() => setOpenAddEvent(false)}><CloseIcon /></IconButton>
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
              <Button fullWidth sx={{ bgcolor: "#F3F4F6", color: "#111", borderRadius: "10px", height: 44 }} onClick={() => setOpenAddEvent(false)}>Cancel</Button>
              <Button
                fullWidth
                sx={{
                  bgcolor: "#4B4B4B",
                  color: "#FFF",
                  borderRadius: "10px",
                  height: 44,
                  "&:hover": {
                    bgcolor: "#333333",
                    color: "#FFF"
                  }
                }}
                onClick={() => {
                  if (!newEventName.trim()) {
                    setEventError("Event name is required");
                    toast.error("Event name is required");
                    return;
                  }
                  const newEvent = { name: newEventName.trim(), count: 0, assigned: 0, unassigned: 0 };
                  setEvents(prev => [...prev, newEvent]);
                  setTasksByEvent(prev => ({ ...prev, [newEventName.trim()]: [] }));
                  setSelectedEvent(newEventName.trim());
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
        </Dialog></div>
    )
}