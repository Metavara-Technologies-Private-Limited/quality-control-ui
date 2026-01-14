import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Stack,
  IconButton,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { eventApi } from "@/services/api";

/* ---------------- HEADER ---------------- */
const EventsHeader = ({ onCreate, onSearch }: any) => (
  <Stack direction="row" justifyContent="space-between" mb={2}>
    <Typography fontSize={18} fontWeight={600} color="#000">
      Events
    </Typography>

    <Stack direction="row" spacing={2}>
      <TextField
        size="small"
        placeholder="Search Events"
        sx={{ width: 220 }}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
        onChange={(e) => onSearch(e.target.value)}
      />

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ textTransform: "none", bgcolor: "#000" }}
        onClick={onCreate}
      >
        Create Event
      </Button>
    </Stack>
  </Stack>
);

/* ---------------- DETAIL VIEW ---------------- */
const EventDetailView = ({ event, onBack }: any) => (
  <Box p={3}>
    <Stack direction="row" spacing={1} mb={3}>
      <IconButton onClick={onBack} size="small">
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <Typography variant="body2" color="#000">
        Quality Control &gt; Events
      </Typography>
    </Stack>

    <Typography fontSize={20} fontWeight={600} mb={3} color="#000">
      {event.name}
    </Typography>

    <Card sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Typography fontSize={12} color="#000">
            Event Name
          </Typography>
          <TextField fullWidth value={event.name} disabled size="small" />
        </Grid>

        <Grid item xs={6}>
          <Typography fontSize={12} color="#000">
            Created Date
          </Typography>
          <TextField fullWidth value={event.createdDate} disabled size="small" />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* -------- SCHEDULE (VIEW PAGE ONLY) -------- */}
        <Grid item xs={12}>
          <Typography fontWeight={600} mb={1} color="#000">
            Schedule
          </Typography>

          <Box display="flex" gap={4} fontSize={14}>
            <Box>
              <Typography color="#000">Type</Typography>
              <Typography color="#000">{event.scheduleType}</Typography>
            </Box>

            <Box>
              <Typography color="#000">From - To</Typography>
              <Typography color="#000">{event.time}</Typography>
            </Box>

            <Box>
              <Typography color="#000">Days</Typography>
              <Typography color="#000">{event.days}</Typography>
            </Box>
          </Box>
        </Grid>

        {/* -------- EQUIPMENT -------- */}
        <Grid item xs={12}>
          <Typography fontWeight={600} mb={1.5} color="#000">
            Equipment
          </Typography>

          <Box border="1px solid #E5E7EB" borderRadius={2}>
            <Box display="flex" px={2} py={1} bgcolor="#F9FAFB">
              <Box width="30%" color="#000">
                Equipment Name
              </Box>
              <Box width="70%" color="#000">
                Parameters
              </Box>
            </Box>

            {event.equipmentsDetails.map((eq: any, idx: number) => (
              <Box
                key={idx}
                display="flex"
                px={2}
                py={1.5}
                borderTop="1px solid #E5E7EB"
              >
                <Box width="30%" fontSize={14} color="#000">
                  {eq.equipment_name}
                </Box>

                <Box width="70%" display="flex" gap={1} flexWrap="wrap">
                  {eq.parameters.map((p: any, i: number) => (
                    <Chip
                      key={i}
                      label={p.name}
                      size="small"
                      sx={{
                        bgcolor: "#F3F4F6",
                        color: "#000",
                        fontSize: 12,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* -------- ASSIGNEE -------- */}
        <Grid item xs={12}>
          <Typography fontWeight={600} mb={1} color="#000">
            Assignee
          </Typography>

          <Stack direction="row" spacing={1}>
            <Avatar>{event.createdBy?.charAt(0)}</Avatar>
            <Typography color="#000">{event.createdBy}</Typography>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  </Box>
);

/* ---------------- TABLE LIST ---------------- */
const EventsTable = ({ data, onRowClick }: any) => (
  <Card>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ color: "#000" }}>Event Name</TableCell>
          <TableCell sx={{ color: "#000" }}>Created By</TableCell>
          <TableCell sx={{ color: "#000" }}>Created Date</TableCell>
          <TableCell sx={{ color: "#000" }}>Schedule</TableCell>
          <TableCell sx={{ color: "#000" }} align="center">
            Equipments
          </TableCell>
          <TableCell sx={{ color: "#000" }} align="center">
            Parameters
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {data.map((row: any) => (
          <TableRow
            key={row.id}
            hover
            sx={{
              cursor: "pointer",
              "& td": {
                color: "#000",
                fontWeight: 400,
              },
            }}
            onClick={() => onRowClick(row)}
          >
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.createdBy}</TableCell>
            <TableCell>{row.createdDate}</TableCell>
            <TableCell>{row.scheduleType}</TableCell>
            <TableCell align="center">{row.equipmentCount}</TableCell>
            <TableCell align="center">{row.parameterCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

/* ---------------- API MAPPER ---------------- */
const mapEventToRow = (e: any) => ({
  id: e.id,
  name: e.event_name,
  createdBy: e.assignment ?? "-",
  createdDate: new Date(e.created_at).toLocaleDateString(),
  scheduleType: e.schedule?.type === 2 ? "Weekly" : "One Time",
  time: "10:00 AM - 2:00 PM",
  days: "Sunday, Monday",
  equipmentCount: e.equipments?.length || 0,
  parameterCount: e.parameters?.length || 0,
  equipmentsDetails: (e.equipments || []).map((eq: any) => ({
    equipment_name: eq.equipment__equipment_name,
    parameters: (e.parameters || []).map((p: any) => ({
      name: p.parameter__parameter_name,
    })),
  })),
});

/* ---------------- MAIN ---------------- */
const Events = () => {
  const navigate = useNavigate();
  const { data: clinic } = useSelector((s: RootState) => s.clinic);
  const [events, setEvents] = useState<any[]>([]);
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  useEffect(() => {
    if (!clinic?.id) return;
    eventApi.listByClinic(clinic.id, 1, 10).then((res) => {
      setEvents(res.data.results.map(mapEventToRow));
    });
  }, [clinic?.id]);

  if (viewingEvent) {
    return (
      <EventDetailView
        event={viewingEvent}
        onBack={() => setViewingEvent(null)}
      />
    );
  }

  return (
    <Box p={3}>
      <EventsHeader
        onCreate={() => navigate("/configuration/events/create")}
        onSearch={() => {}}
      />
      <EventsTable data={events} onRowClick={setViewingEvent} />
    </Box>
  );
};

export default Events;