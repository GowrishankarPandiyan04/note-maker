import React, { useEffect } from "react";
import API from "../api";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { FiEdit } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

const Home = () => {
  const [subjectName, setSubjectName] = React.useState("");
  const [subjectDescription, setSubjectDescription] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [deleteIndex, setDeleteIndex] = React.useState(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [showDescription, setShowDescription] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [name, setName] = React.useState("Guest");

  const navigate = useNavigate();
  const { id } = useParams();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Decode token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const username = decoded.name || decoded.username || decoded.sub;
      setName(username);
    } catch (error) {
      console.error("Failed to decode token:", error);
      setName("Guest");
      localStorage.removeItem("token");
    }
  }, []);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err.response?.data || err.message);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const fetchSubjectById = async (id) => {
    try {
      const res = await API.get(`/subjects/${id}`);
      setItems([res.data]);
    } catch (err) {
      console.error("Error fetching subject:", err.response?.data || err.message);
      if (err.response?.status === 401) navigate("/login");
      else if (err.response?.status === 404) setItems([]);
    }
  };

  useEffect(() => {
    if (id) fetchSubjectById(id);
    else fetchSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Add subject
  const handleAddSubject = async () => {
    if (!subjectName) return;

    try {
      const res = await API.post("/subjects", {
        subjectName,
        subjectContent: subjectDescription || "None",
      });
      setItems([res.data.subject, ...items]);
      setSubjectName("");
      setSubjectDescription("");
      setShowDescription(false);
      setFormOpen(false);
    } catch (err) {
      console.error("Error adding subject:", err);
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  // Update subject
  const handleUpdateSubject = async () => {
    if (!subjectName || !editingId) return;

    try {
      const res = await API.put(`/subjects/${editingId}`, {
        subjectName,
        subjectContent: subjectDescription,
      });

      const updatedItems = items.map((item) =>
        item._id === editingId ? res.data.subject : item
      );
      setItems(updatedItems);
      setFormOpen(false);
      setSubjectName("");
      setSubjectDescription("");
      setEditingId(null);
      setShowDescription(false);
    } catch (err) {
      console.error("Error updating subject:", err);
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  // Delete subject
  const handleOpenDelete = (index) => {
    setDeleteIndex(index);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const subjectToDelete = items[deleteIndex];
      await API.delete(`/subjects/${subjectToDelete._id}`);
      const updatedItems = items.filter((_, i) => i !== deleteIndex);
      setItems(updatedItems);
      setSnackbarMessage("Item deleted successfully");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error deleting subject:", err);
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setOpenDialog(false);
      setDeleteIndex(null);
    }
  };

  const resetAddForm = () => {
    setOpenDialog(false);
    setSubjectName("");
    setSubjectDescription("");
    setEditingId(null);
  };

  const filteredItems = items.filter(
    (item) =>
      item.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectContent?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{
      flexGrow: 1,
      p: 4,
      minHeight: "100vh",
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          p: 3,
          backgroundColor: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6495ed 0%, #4778d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <EventNoteOutlinedIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: '#1e293b' }}
            >
              Welcome back, {name}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your subjects and notes
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormOpen(true);
            setShowDescription(false);
            setSubjectName("");
            setSubjectDescription("");
            setEditingId(null);
          }}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            fontSize: "1rem",
            background: 'linear-gradient(135deg, #6495ed 0%, #4778d9 100%)',
            boxShadow: '0 4px 14px 0 rgb(100 149 237 / 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4778d9 0%, #345bb3 100%)',
              boxShadow: '0 6px 20px rgb(100 149 237 / 0.4)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Add Subject
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Search subjects..."
          variant="outlined"
          size="medium"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
              '&:hover': {
                boxShadow: '0 4px 8px rgb(0 0 0 / 0.15)',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgb(100 149 237 / 0.1)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#64748b' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Subjects list */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <Card
              key={index}
              sx={{
                position: "relative",
                height: '100%',
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 3,
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: "0.3s",
                '&:hover': {
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              {/* Edit Button */}
              <Button
                onClick={() => {
                  setSubjectName(item.subjectName);
                  setSubjectDescription(item.subjectContent);
                  setEditingId(item._id);
                  setFormOpen(true);
                  setShowDescription(true);
                }}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  minWidth: 0,
                  width: 40,
                  height: 40,
                  padding: 0,
                  borderRadius: "50%",
                  background: 'linear-gradient(135deg, #6495ed 0%, #4778d9 100%)',
                  color: "#ffffff",
                  boxShadow: '0 2px 8px rgb(100 149 237 / 0.3)',
                  zIndex: 10,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4778d9 0%, #345bb3 100%)',
                    boxShadow: '0 4px 12px rgb(100 149 237 / 0.5)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <FiEdit size={20} />
              </Button>

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "left",
                  p: 3,
                  pt: 4,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.subjectName || "No Name"}
                </Typography>

                <Box display="flex" alignItems="center" mb={2} sx={{ color: '#64748b' }}>
                  <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString("en-GB", {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                  }}
                >
                  {item.subjectContent || "No description available"}
                </Typography>
              </CardContent>

              {/* View & Delete */}
              <CardActions sx={{ p: 3, pt: 0, justifyContent: "space-between", gap: 1 }}>
                <Button
                  onClick={() => navigate(`/subjects/${item._id}/topics`)}
                  variant="contained"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    py: 1,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6495ed 0%, #4778d9 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4778d9 0%, #345bb3 100%)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  View Topics
                </Button>
                <Button
                  onClick={() => handleOpenDelete(index)}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    py: 1,
                    fontWeight: 600,
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: '#fef2f2',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          <Box
            sx={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              px: 4,
              backgroundColor: '#ffffff',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <EventNoteOutlinedIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              No subjects found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first subject to get started'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            bgcolor: 'linear-gradient(135deg, #6495ed 0%, #4778d9 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
          }}
        >
          {editingId ? "Edit Subject" : "Add New Subject"}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (editingId) handleUpdateSubject();
              else handleAddSubject();
            }}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
          >
            <TextField
              placeholder="Enter Subject Name (e.g., Chemistry)"
              label="Subject Name"
              variant="outlined"
              size="medium"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              fullWidth
              required
            />

            {showDescription ? (
              <TextField
                placeholder="Enter Subject Overview (optional)"
                label="Description"
                variant="outlined"
                size="medium"
                multiline
                minRows={2}
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                fullWidth
              />
            ) : (
              <Button
                variant="dashed"
                onClick={() => setShowDescription(true)}
                startIcon={<AddIcon />}
                sx={{
                  alignSelf: "flex-start",
                  borderStyle: "dashed",
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  color: "#555",
                  borderColor: "#bbb",
                  "&:hover": { borderColor: "#1976d2", color: "#1976d2", bgcolor: "#f0f6ff" },
                }}
              >
                Add Description
              </Button>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            onClick={() => setFormOpen(false)}
            sx={{
              borderRadius: 3,
              px: 4,
              textTransform: "none",
              bgcolor: "#f1f1f1",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingId ? handleUpdateSubject : handleAddSubject}
            variant="contained"
            sx={{
              borderRadius: 3,
              px: 4,
              textTransform: "none",
              bgcolor: "#1976d2",
              fontWeight: 500,
              "&:hover": { bgcolor: "#1565c0" },
            }}
            startIcon={<AddIcon />}
          >
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this subject? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            onClick={resetAddForm}
            sx={{
              borderRadius: 2,
              px: 4,
              backgroundColor: "#e4e3e1ff",
              color: "black",
              textTransform: "none",
              "&:hover": { backgroundColor: "#d7d7d7ff" },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: 2,
              px: 4,
              backgroundColor: "#d32f2f",
              color: "white",
              textTransform: "none",
              ml: 2,
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
