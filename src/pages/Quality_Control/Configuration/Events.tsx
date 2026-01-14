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

// Figma Colors
const COLORS = {
  background: "#F8F9FB",
  primaryButton: "#111827",
  searchIcon: "#9CA3AF",
  tableHeader: "#374151",
  textPrimary: "#111827", // Pure Black
  avatarBg: "#E5E7EB",
};

// ---------------- HEADER ----------------
const EventsHeader = ({
  onCreate,
  onSearch,
}: {
  onCreate: () => void;
  onSearch: (value: string) => void;
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
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

// ---------------- DETAIL VIEW (FIXED TO SHOW EQUIP/PARAMS) ----------------
const EventDetailView = ({ event, onBack }: { event: any; onBack: () => void }) => (
  <Box sx={{ p: 3 }}>
    <Stack direction="row" spacing={1} alignItems="center" mb={3}>
      <IconButton onClick={onBack} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "4px" }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <Typography variant="body2" color="textSecondary">
        Quality Control &gt; Configuration &gt; <b>Events</b>
      </Typography>
    </Stack>

    <Typography variant="h5" fontWeight={700} mb={3} color={COLORS.textPrimary}>
      {event.name}
    </Typography>

    <Card sx={{ p: 4, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "none" }}>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Typography variant="caption" fontWeight={600} color="textSecondary">Event Name</Typography>
          <TextField fullWidth value={event.name} disabled size="small" sx={{ mt: 1, "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: COLORS.textPrimary, color: COLORS.textPrimary } }} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" fontWeight={600} color="textSecondary">Created Date</Typography>
          <TextField fullWidth value={event.createdDate} disabled size="small" sx={{ mt: 1, "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: COLORS.textPrimary, color: COLORS.textPrimary } }} />
        </Grid>
        
        <Grid item xs={12}><Divider /></Grid>

        {/* NEW SECTION: Displays the equipment and their parameters */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={700} color={COLORS.textPrimary} mb={2}>
            Equipment & Parameters
          </Typography>
          <Box border="1px solid #E5E7EB" borderRadius="12px" overflow="hidden">
            {event.equipmentsDetails && event.equipmentsDetails.length > 0 ? (
              event.equipmentsDetails.map((item: any, idx: number) => (
                <Box key={idx} p={2} display="flex" borderBottom={idx !== event.equipmentsDetails.length - 1 ? "1px solid #F1F5F9" : "none"}>
                  <Box width={250}>
                    <Typography fontSize={14} fontWeight={600} color={COLORS.textPrimary}>
                      {item.equipment_name || item.name}
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" gap={1} flexWrap="wrap">
                    {item.parameters?.map((p: any, pIdx: number) => (
                      <Chip key={pIdx} label={p.name || p} size="small" sx={{ bgcolor: "#F5F7FA", borderRadius: "6px", fontWeight: 500, color: COLORS.textPrimary }} />
                    ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Box p={3} textAlign="center" color="textSecondary">No equipment added to this event.</Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}><Divider /></Grid>

        <Grid item xs={6}>
           <Typography variant="subtitle1" fontWeight={700} mt={2} color={COLORS.textPrimary}>Schedule</Typography>
           <Typography variant="body2" color="textSecondary" mt={1}>{event.schedule}</Typography>
        </Grid>

        <Grid item xs={6}>
           <Typography variant="subtitle1" fontWeight={700} mt={2} color={COLORS.textPrimary}>Assignee</Typography>
           <Stack direction="row" spacing={2} mt={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 24, height: 24 }}>{event.createdBy?.charAt(0) || "U"}</Avatar>
                <Typography variant="body2" color={COLORS.textPrimary}>{event.createdBy}</Typography>
              </Stack>
           </Stack>
        </Grid>
      </Grid>
    </Card>
  </Box>
);

// ---------------- TABLE ----------------
const EventsTable = ({
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowClick,
}: {
  data: any[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowClick: (event: any) => void;
}) => {
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const from = totalCount === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, totalCount);

  return (
    <Card sx={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "none" }}>
      <Table>
        <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>Event Name</TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>Created By</TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>Created Date</TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }}>Schedule On</TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }} align="center">Total Equipment</TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.tableHeader }} align="center">Total Parameters</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow 
                key={row.id} 
                hover 
                onClick={() => onRowClick(row)} 
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ color: COLORS.textPrimary, fontWeight: 400 }}>{row.name}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 28, height: 28, bgcolor: COLORS.avatarBg }}>
                      {row.createdBy?.charAt(0) || "U"}
                    </Avatar>
                    <Typography variant="body2" color={COLORS.textPrimary}>{row.createdBy}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: COLORS.textPrimary }}>{row.createdDate}</TableCell>
                <TableCell sx={{ color: COLORS.textPrimary }}>{row.schedule}</TableCell>
                <TableCell align="center" sx={{ color: COLORS.textPrimary }}>{row.equipmentCount}</TableCell>
                <TableCell align="center" sx={{ color: COLORS.textPrimary }}>{row.parameterCount}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#9CA3AF" }}>No events found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
        <Typography variant="body2" color="#6B7280">
          Showing <b>{from}</b> to <b>{to}</b> of <b>{totalCount}</b> entries
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" disabled={page === 0} onClick={(e) => {e.stopPropagation(); onPageChange(page - 1);}} sx={{ border: "1px solid #E5E7EB", borderRadius: "4px" }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} onClick={(e) => {e.stopPropagation(); onPageChange(i);}} sx={{ minWidth: 32, height: 32, borderRadius: "4px", backgroundColor: page === i ? COLORS.primaryButton : "transparent", color: page === i ? "#fff" : "#6B7280", border: page === i ? "none" : "1px solid #E5E7EB", fontSize: "14px" }}>
              {i + 1}
            </Button>
          ))}
          <IconButton size="small" disabled={page >= totalPages - 1} onClick={(e) => {e.stopPropagation(); onPageChange(page + 1);}} sx={{ border: "1px solid #E5E7EB", borderRadius: "4px" }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

// ---------------- MAPPER ----------------
const mapEventToRow = (e: any) => ({
  id: e.id,
  name: e.event_name,
  createdBy: e.assignment_name ?? e.assignment ?? "-",
  createdDate: e.created_at ? new Date(e.created_at).toLocaleDateString() : "-",
  schedule: e.schedule?.type === 2 ? `Weekly` : "One Time",
  equipmentCount: e.equipments?.length || 0,
  parameterCount: e.parameters?.length || 0,
  // We store the full equipment array here so the detail view can display it
  equipmentsDetails: e.equipments || []
});

// ---------------- MAIN PAGE ----------------
const Events = () => {
  const navigate = useNavigate();
  const { data: clinic } = useSelector((s: RootState) => s.clinic);

  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [viewingEvent, setViewingEvent] = useState<any | null>(null);

  const rowsPerPage = 10;

  const fetchEvents = async () => {
    if (!clinic?.id) return;
    try {
      const res = await eventApi.listByClinic(clinic.id, page + 1, rowsPerPage);
      const raw = res.data.results || res.data;
      setEvents(raw.map(mapEventToRow));
      setTotalCount(res.data.count ?? raw.length);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEvents(); }, [clinic?.id, page]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  if (viewingEvent) {
    return (
      <Box sx={{ backgroundColor: COLORS.background, minHeight: "100vh" }}>
        <EventDetailView 
          event={viewingEvent} 
          onBack={() => setViewingEvent(null)} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: COLORS.background, minHeight: "100vh" }}>
      <EventsHeader
        onCreate={() => navigate("/configuration/events/create")}
        onSearch={handleSearch}
      />

      <EventsTable
        data={filteredEvents}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowClick={(row) => setViewingEvent(row)} 
      />
    </Box>
  );
};

export default Events;