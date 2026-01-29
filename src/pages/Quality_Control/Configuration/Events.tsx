import { useNavigate } from "react-router-dom";
import { Box, Card, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/store";
import { fetchEventsByClinic } from "@/store/eventSlice";
import { EventsHeader, EventsTable, EventDetailView } from "../../../components/Configuration/Events/Eventscomponents";
import { mapEventToRow } from "../../../components/Configuration/Events/Eventutils";

const COLORS = {
  textPrimary: "#000000",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  bgLight: "#F9FAFB",
  bgChip: "#F3F4F6",
};

const Events = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const rawEvents = useSelector((s: RootState) => s.events.data);
  const eventLoading = useSelector((s: RootState) => s.events.loading);
  const { data: clinic } = useSelector((s: RootState) => s.clinic);

  const [viewingEvent, setViewingEvent] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const rowsPerPage = 10;

  useEffect(() => {
    if (clinic?.id) {
      dispatch(fetchEventsByClinic(clinic.id));
    }
  }, [clinic?.id, dispatch]);

  const events = rawEvents.map((e) => mapEventToRow(e, clinic));

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const paginatedEvents = filteredEvents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {viewingEvent ? (
        <EventDetailView
          event={viewingEvent}
          onBack={() => setViewingEvent(null)}
        />
      ) : (
        <>
          <EventsHeader
            onCreate={() => navigate("/configuration/events/create")}
            onSearch={(val: string) => {
              setSearch(val);
              setPage(0);
            }}
          />
          {eventLoading ? (
            <Card
              sx={{
                borderRadius: "12px",
                border: `1px solid ${COLORS.border}`,
                boxShadow: "none",
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography fontSize={14} color={COLORS.textMuted}>
                Loading events...
              </Typography>
            </Card>
          ) : (
            <EventsTable
              data={paginatedEvents}
              page={page}
              rowsPerPage={rowsPerPage}
              total={filteredEvents.length}
              onPageChange={setPage}
              onRowClick={setViewingEvent}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default Events;