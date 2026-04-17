import React, { useState, useEffect } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Container,
  MenuItem,
  Select,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../api";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function MyCalendar({ drawerOpen }) {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const drawerWidth = 240;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Fetch subjects & topics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const subjectsRes = await API.get("/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let allEvents = [];

        for (const s of subjectsRes.data) {
          allEvents.push({
            title: `📘 ${s.subjectName}`,
            start: new Date(s.createdAt),
            end: new Date(s.createdAt),
            allDay: true,
            type: "subject",
            id: s._id,
          });

          const topicsRes = await API.get(`/topics/${s._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const topicEvents = topicsRes.data.map((t) => ({
            title: `📝 ${t.title}`,
            start: new Date(t.createdAt),
            end: new Date(t.createdAt),
            allDay: true,
            type: "topic",
            id: t._id,
          }));

          allEvents.push(...topicEvents);
        }

        setEvents(allEvents);
      } catch (err) {
        console.error("Failed to fetch subjects or topics", err);
      }
    };
    fetchData();
  }, []);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Event styles
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.type === "subject" ? "#6C5CE7" : "#FD79A8",
      borderRadius: "8px",
      color: "white",
      border: "none",
      padding: "3px 5px",
      fontSize: "0.75rem",
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500,
      cursor: "pointer",
      transition: "0.3s ease",
    },
  });

  // Month/year toolbar
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const CustomToolbar = ({ date, onDateChange }) => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    const handleMonthChange = (e) => {
      const newDate = new Date(date);
      newDate.setMonth(e.target.value);
      onDateChange(newDate);
    };

    const handleYearChange = (e) => {
      const newDate = new Date(date);
      newDate.setFullYear(e.target.value);
      onDateChange(newDate);
    };

    return (
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        gap={isMobile ? 1 : 2}
        mb={2}
      >
        <Select
          value={date.getMonth()}
          onChange={handleMonthChange}
          variant="outlined"
          sx={{
            backgroundColor: "white",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            borderRadius: "10px",
            minWidth: isMobile ? "100%" : "140px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          {months.map((m) => (
            <MenuItem key={m} value={m}>
              {format(new Date(date.getFullYear(), m), "MMMM")}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={date.getFullYear()}
          onChange={handleYearChange}
          variant="outlined"
          sx={{
            backgroundColor: "white",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            borderRadius: "10px",
            minWidth: isMobile ? "100%" : "90px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  };

  const EventComponent = ({ event }) => (
    <Tooltip title={event.title} arrow placement="top">
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {event.title}
      </span>
    </Tooltip>
  );

  // Click event → open dialog
  const handleSelectEvent = (event) => setSelectedEvent(event);
  const handleCloseDialog = () => setSelectedEvent(null);

  // Navigation logic
  const handleGoTo = () => {
    if (!selectedEvent) return;

    if (selectedEvent.type === "subject") {
      // Go to home page
      navigate("/");
    } else if (selectedEvent.type === "topic") {
      // Go to that topic's notes page
      navigate(`/topics/${selectedEvent.id}/notes`);
    }
    setSelectedEvent(null);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '100vh', py: 2 }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '75vh' : '78vh',
          width: '100%',
          overflow: 'hidden',
          px: isMobile ? 1 : 4,
          py: 2,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            p: isMobile ? 2 : 3,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, #1e293b, #0f172a)'
              : 'linear-gradient(145deg, #f5f5f5, #ffffff)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <CustomToolbar date={date} onDateChange={setDate} />

          <Box
            sx={{
              flex: '1 1 0',
              width: drawerOpen ? `calc(100% - ${drawerWidth / 2}px)` : '95%',
              height: isMobile ? '58vh' : '62vh',
              mx: 'auto',
              borderRadius: 3,
              overflow: 'hidden',
              transition: 'width 0.3s ease',
              '& .rbc-calendar': {
                backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
              '& .rbc-header': {
                backgroundColor: '#3d314a',
                color: '#e0ddcf',
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                padding: '6px',
                fontSize: '0.9rem',
              },
              '& .rbc-today': {
                backgroundColor: 'rgba(108,92,231,0.1)',
              },
            }}
          >
            <BigCalendar
              key={windowWidth}
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              views={["month"]}
              date={date}
              onNavigate={setDate}
              style={{ height: '100%', width: '100%' }}
              eventPropGetter={eventStyleGetter}
              components={{ event: EventComponent }}
              onSelectEvent={handleSelectEvent}
              popup
            />
          </Box>
        </Paper>

        {/* Event Dialog */}
        <Dialog
          open={Boolean(selectedEvent)}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 1,
              background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              textAlign: 'center',
              color: selectedEvent?.type === 'subject' ? '#6C5CE7' : '#FD79A8',
            }}
          >
            {selectedEvent?.title}
          </DialogTitle>

          <DialogContent
            sx={{
              textAlign: 'center',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.95rem',
              color: '#2d3436',
            }}
          >
            {selectedEvent?.type === 'subject'
              ? 'View all subjects and their topics on the home page.'
              : 'Open this topic to view or edit your notes.'}
          </DialogContent>

          <DialogActions
            sx={{
              display: 'flex',
              justifyContent: 'center',
              pb: 2,
            }}
          >
            <Button
              onClick={handleGoTo}
              variant="contained"
              sx={{
                backgroundColor:
                  selectedEvent?.type === 'subject' ? '#6C5CE7' : '#FD79A8',
                color: '#fff',
                textTransform: 'none',
                fontFamily: "'Poppins', sans-serif",
                px: 3,
                '&:hover': { opacity: 0.9 },
              }}
            >
              {selectedEvent?.type === 'subject' ? 'Go to Subject' : 'Go to Topic'}
            </Button>

            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontFamily: "'Poppins', sans-serif",
                borderColor: '#b2bec3',
                color: '#636e72',
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default MyCalendar;
