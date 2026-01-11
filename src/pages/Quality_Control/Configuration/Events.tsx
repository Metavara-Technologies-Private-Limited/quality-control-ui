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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { eventsData } from "@/utils/mockData";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { eventApi } from "@/services/api";

// Figma Colors
const COLORS = {
  background: "#F8F9FB",
  primaryButton: "#111827",
  searchIcon: "#9CA3AF",
  tableHeader: "#374151",
  textPrimary: "#111827",
  avatarBg: "#E5E7EB",
};

// Header Component
const EventsHeader = ({
  onCreate,
  onSearch,
}: {
  onCreate: () => void;
  onSearch: (value: string) => void;
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    mb={2}
  >
    <Typography fontSize={18} fontWeight={600} color={COLORS.textPrimary}>
      Events
    </Typography>

    <Stack direction="row" spacing={2}>
      <TextField
        size="small"
        placeholder="Search Events"
        sx={{ width: 220 }}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ color: COLORS.searchIcon, mr: 1 }} />
          ),
        }}
        onChange={(e) => onSearch(e.target.value)}
      />

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          textTransform: "none",
          backgroundColor: COLORS.primaryButton,
          borderRadius: "8px",
          "&:hover": { backgroundColor: "#0f172a" },
        }}
        onClick={onCreate}
      >
        Create Event
      </Button>
    </Stack>
  </Stack>
);

// Table Component
const EventsTable = ({ data = eventsData }) => (
  <Card sx={{ borderRadius: "12px" }}>
    <Table>
      <TableHead sx={{ backgroundColor: "#F3F4F6" }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>
            Event Name
          </TableCell>
          <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>
            Created By
          </TableCell>
          <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>
            Created Date
          </TableCell>
          <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>
            Schedule On
          </TableCell>
          <TableCell
            sx={{ fontWeight: 600, color: COLORS.tableHeader }}
            align="center"
          >
            Total No Equipment
          </TableCell>
          <TableCell
            sx={{ fontWeight: 600, color: COLORS.tableHeader }}
            align="center"
          >
            Total No Parameter
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id} hover>
            <TableCell sx={{ color: COLORS.textPrimary }}>{row.name}</TableCell>

            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar
                  sx={{ width: 28, height: 28, bgcolor: COLORS.avatarBg }}
                >
                  {row.createdBy.charAt(0)}
                </Avatar>
                <Typography variant="body2" color={COLORS.textPrimary}>
                  {row.createdBy}
                </Typography>
              </Stack>
            </TableCell>

            <TableCell sx={{ color: COLORS.textPrimary }}>
              {row.createdDate}
            </TableCell>
            <TableCell sx={{ color: COLORS.textPrimary }}>
              {row.schedule}
            </TableCell>
            <TableCell align="center" sx={{ color: COLORS.textPrimary }}>
              {row.equipmentCount}
            </TableCell>
            <TableCell align="center" sx={{ color: COLORS.textPrimary }}>
              {row.parameterCount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

const mapEventToRow = (e: any) => ({
  id: e.id,
  name: e.event_name,
  createdBy: e.assignment ?? "-",
  createdDate: new Date(e.created_at).toLocaleDateString(),
  schedule:
    e.schedule?.type === 2
      ? `Weekly (${(e.schedule.days || []).join(", ")})`
      : "One Time",
  equipmentCount: e.equipments?.length ?? 0,
  parameterCount: e.parameters?.length ?? 0,
});

// Main Component
const Events = () => {
  const navigate = useNavigate();
  const { data: clinic } = useSelector((s: RootState) => s.clinic);

  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!clinic?.id) return;

    eventApi
      .listByClinic(clinic.id)
      .then((res) => {
        setEvents(res.data.results.map(mapEventToRow)); // ✅ results
      })
      .catch(console.error);
  }, [clinic?.id]);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateEvent = () => {
    navigate("/configuration/events/create");
  };

  return (
    <Box sx={{ p: 3, backgroundColor: COLORS.background, minHeight: "100%" }}>
      <EventsHeader onCreate={handleCreateEvent} onSearch={setSearch} />
      <EventsTable data={filteredEvents} />
    </Box>
  );
};

export default Events;
