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
  TableContainer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const COLORS = {
  textPrimary: "#000000",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  bgLight: "#F9FAFB",
  bgChip: "#F3F4F6",
};

export const EventsHeader = ({ onCreate, onSearch }: any) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    mb={3}
    alignItems={{ xs: "stretch", sm: "center" }}
    gap={1.5}
  >
    <Typography fontSize={18} fontWeight={700} color={COLORS.textPrimary}>
      Events
    </Typography>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <TextField
        size="small"
        placeholder="Search Events"
        sx={{
          width: { xs: "100%", sm: 250 },
          "& .MuiOutlinedInput-root": { borderRadius: "8px" },
        }}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ mr: 1, color: COLORS.textMuted }} />
          ),
        }}
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          textTransform: "none",
          bgcolor: "#111827",
          borderRadius: "8px",
          px: 3,
          width: { xs: "100%", sm: "auto" },
          "&:hover": { bgcolor: "#000" },
        }}
        onClick={onCreate}
      >
        Create Event
      </Button>
    </Stack>
  </Stack>
);

export const EventDetailView = ({ event, onBack }: any) => (
  <Box>
    <Stack direction="row" alignItems="center" mb={2.5}>
      <IconButton
        onClick={onBack}
        sx={{
          width: 28,
          height: 28,
          padding: 0,
          color: "#374151",
          borderRadius: 1,
          boxShadow: "1px 1px 4px rgba(0,0,0,0.2)",
          backgroundColor: "#fff",
          "&:hover": {
            backgroundColor: "#F3F4F6",
          },
        }}
      >
        <TurnLeftIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Stack>

    <Card
      sx={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "none",
      }}
    >
      <Box p={3} borderBottom={`1px solid ${COLORS.bgChip}`}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontSize={20} fontWeight={700} color={COLORS.textPrimary}>
            {event.name}
          </Typography>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography fontSize={12} color={COLORS.textMuted}>
              Created Date:{" "}
              <span style={{ color: COLORS.textSecondary }}>
                {event.createdDate}
              </span>
            </Typography>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ height: 14, my: "auto" }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontSize={12} color={COLORS.textMuted}>
                Created By:
              </Typography>
              <Avatar
                sx={{ width: 22, height: 22, fontSize: 10, bgcolor: "#E5E7EB" }}
              >
                {event.createdBy?.charAt(0)}
              </Avatar>
              <Typography fontSize={12} color={COLORS.textPrimary}>
                {event.createdBy}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Box p={3.5}>
        <Typography
          fontSize={14}
          fontWeight={700}
          mb={3}
          color={COLORS.textPrimary}
        >
          Event Name
        </Typography>
        <Grid container spacing={3} mb={5}>
          <Grid item xs={12} md={5}>
            <Box sx={{ position: "relative" }}>
              <Typography
                sx={{
                  position: "absolute",
                  top: -10,
                  left: 12,
                  bgcolor: "white",
                  px: 0.5,
                  fontSize: 11,
                  color: COLORS.textMuted,
                  fontWeight: 600,
                  zIndex: 1,
                }}
              >
                Name
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: "8px",
                  border: `1px solid ${COLORS.border}`,
                  minHeight: "48px",
                }}
              >
                <Typography fontSize={15} color={COLORS.textPrimary}>
                  {event.name}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ position: "relative" }}>
              <Typography
                sx={{
                  position: "absolute",
                  top: -10,
                  left: 12,
                  bgcolor: "white",
                  px: 0.5,
                  fontSize: 11,
                  color: COLORS.textMuted,
                  fontWeight: 600,
                  zIndex: 1,
                }}
              >
                Description
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: "8px",
                  border: `1px solid ${COLORS.border}`,
                  minHeight: "48px",
                }}
              >
                <Typography fontSize={15} color={COLORS.textPrimary}>
                  {event.description}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        <Typography
          fontSize={15}
          fontWeight={700}
          mb={1.5}
          color={COLORS.textPrimary}
        >
          Schedule
        </Typography>
        <Typography
          fontSize={14}
          fontWeight={600}
          mb={3.5}
          color={COLORS.textPrimary}
        >
          {event.scheduleType}
        </Typography>

        <Grid container columnSpacing={10} rowSpacing={4} mb={6}>
          <Grid item>
            <Typography
              fontSize={12}
              color={COLORS.textMuted}
              fontWeight={600}
              mb={1.5}
            >
              From Time
            </Typography>
            <Typography fontSize={15} color={COLORS.textPrimary}>
              {event.fromTime}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              fontSize={12}
              color={COLORS.textMuted}
              fontWeight={600}
              mb={1.5}
            >
              To Time
            </Typography>
            <Typography fontSize={15} color={COLORS.textPrimary}>
              {event.toTime}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              fontSize={12}
              color={COLORS.textMuted}
              fontWeight={600}
              mb={1.5}
            >
              Start Date
            </Typography>
            <Typography fontSize={15} color={COLORS.textPrimary}>
              {event.startDate}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              fontSize={12}
              color={COLORS.textMuted}
              fontWeight={600}
              mb={1.5}
            >
              End Date
            </Typography>
            <Typography fontSize={15} color={COLORS.textPrimary}>
              {event.endDate}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              fontSize={12}
              color={COLORS.textMuted}
              fontWeight={600}
              mb={1.5}
            >
              Recur Every Weeks on
            </Typography>
            <Typography fontSize={15} color={COLORS.textPrimary}>
              {event.recurDuration || "1"}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              fontSize={12}
              color={COLORS.textMuted}
              fontWeight={600}
              mb={1.5}
            >
              Days
            </Typography>
            <Typography fontSize={15} color={COLORS.textPrimary}>
              {event.days}
            </Typography>
          </Grid>
        </Grid>

        <Typography
          fontSize={15}
          fontWeight={700}
          mb={2.5}
          color={COLORS.textPrimary}
        >
          Equipment
        </Typography>
        <TableContainer
          sx={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: "10px",
            mb: 5,
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: COLORS.bgLight }}>
              <TableRow>
                <TableCell sx={{ fontSize: 13, fontWeight: 600, py: 2 }}>
                  Equipment Details
                </TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600, py: 2 }}>
                  Parameters
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {event.equipmentsDetails && event.equipmentsDetails.length > 0 ? (
                event.equipmentsDetails.map((eq: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ width: "30%" }}>
                      <Typography
                        fontSize={14}
                        fontWeight={600}
                        color={COLORS.textPrimary}
                      >
                        {eq.equipment_name}
                      </Typography>

                      {eq.units.length > 0 && (
                        <Typography
                          fontSize={13}
                          color={COLORS.textSecondary}
                          mt={0.5}
                        >
                          {eq.units.join(", ")}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {eq.parameters && eq.parameters.length > 0 ? (
                          eq.parameters.map((p: any, i: number) => (
                            <Chip
                              key={i}
                              label={p.name}
                              size="small"
                              sx={{
                                fontSize: 11,
                                bgcolor: COLORS.bgChip,
                                borderRadius: "6px",
                                height: 24,
                              }}
                            />
                          ))
                        ) : (
                          <Typography fontSize={12} color={COLORS.textMuted}>
                            No parameters
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No equipment data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography
          fontSize={15}
          fontWeight={700}
          mb={2.5}
          color={COLORS.textPrimary}
        >
          Assignee
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            bgcolor: COLORS.bgChip,
            px: 2,
            py: 0.8,
            borderRadius: "24px",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Avatar sx={{ width: 22, height: 22, mr: 1.5, fontSize: 11 }} />
          <Typography fontSize={14} color={COLORS.textPrimary}>
            {event.createdBy}
          </Typography>
        </Box>
      </Box>
    </Card>
  </Box>
);

export const EventsTable = ({
  data,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowClick,
}: any) => {
  const totalPages = Math.ceil(total / rowsPerPage);
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);

  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "none",
      }}
    >
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 560 }}>
          <TableHead sx={{ bgcolor: COLORS.bgLight }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Event Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created By</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Schedule On</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Total No Equipment
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Total No Parameters
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row: any) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => onRowClick(row)}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>{row.createdDate}</TableCell>
                <TableCell>
                  <Typography fontSize={14}>
                    {row.scheduleType} {row.days !== "-" ? `(${row.days})` : ""}
                  </Typography>
                </TableCell>
                <TableCell align="center">{row.equipmentCount}</TableCell>
                <TableCell align="center">{row.parameterCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}
      >
        <Typography variant="body2" color="#6B7280">
          Showing <b>{from}</b> to <b>{to}</b> of <b>{total}</b> entries
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={(e) => {
              e.stopPropagation();
              onPageChange(page - 1);
            }}
            sx={{ border: "1px solid #E5E7EB", borderRadius: "4px" }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onPageChange(i);
              }}
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: "4px",
                backgroundColor: page === i ? "#111827" : "transparent",
                color: page === i ? "#fff" : "#6B7280",
                border: page === i ? "none" : "1px solid #E5E7EB",
                fontSize: "14px",
              }}
            >
              {i + 1}
            </Button>
          ))}
          <IconButton
            size="small"
            disabled={page >= totalPages - 1}
            onClick={(e) => {
              e.stopPropagation();
              onPageChange(page + 1);
            }}
            sx={{ border: "1px solid #E5E7EB", borderRadius: "4px" }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};
