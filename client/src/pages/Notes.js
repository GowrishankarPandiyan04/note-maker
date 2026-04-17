import * as React from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SortIcon from "@mui/icons-material/Sort";
import CloseIcon from "@mui/icons-material/Close";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import API from "../api";
import { useParams } from "react-router-dom";

function NotesPage() {
  const theme = useTheme();
  const { id: topicId } = useParams();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [notes, setNotes] = React.useState([]);
  const [filteredNotes, setFilteredNotes] = React.useState([]);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [newImage, setNewImage] = React.useState(null);
  const [editNote, setEditNote] = React.useState(null);
  const [editImage, setEditImage] = React.useState(null);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [imageDialogSrc, setImageDialogSrc] = React.useState("");

  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
  const [dateRange, setDateRange] = React.useState({ from: "", to: "" });
  const [menuNoteId, setMenuNoteId] = React.useState(null);

  const addEditorRef = React.useRef(null);
  const editEditorRef = React.useRef(null);
  const endOfListRef = React.useRef(null);

  // Fetch notes
  React.useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await API.get(`/notes/${topicId}`);
        const sorted = res.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setNotes(sorted);
        setFilteredNotes(sorted);

        // Scroll to bottom after loading
        setTimeout(() => {
          endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Failed to load notes",
          severity: "error",
        });
      }
    };
    fetchNotes();
  }, [topicId]);

  // Rich text commands
  const execCommand = (command, value = null, isEdit = true) => {
    const ref = isEdit ? editEditorRef.current : addEditorRef.current;
    ref.focus();
    document.execCommand(command, false, value);
  };

  const handleAddLink = (isEdit = true) => {
    const url = prompt("Enter URL:");
    if (url) execCommand("createLink", url, isEdit);
  };

  const handleCopy = (isEdit = true) => {
    const ref = isEdit ? editEditorRef.current : addEditorRef.current;
    navigator.clipboard.writeText(ref.innerText);
    setSnackbar({
      open: true,
      message: "Copied to clipboard",
      severity: "success",
    });
  };

  // Add note
  const handleAddNote = async () => {
    const noteContent = addEditorRef.current.innerHTML;
    if (!noteContent.trim() && !newImage) return;
    try {
      const formData = new FormData();
      formData.append("content", noteContent);
      if (newImage) formData.append("image", newImage);
      const res = await API.post(`/notes/${topicId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedNotes = [...notes, res.data]; // append instead of prepend
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);

      // Scroll to bottom after adding
      setTimeout(() => {
        endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      addEditorRef.current.innerHTML = "";
      setNewImage(null);
      setAddDialogOpen(false);
      setSnackbar({ open: true, message: "Note added", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to add note",
        severity: "error",
      });
    }
  };

  // Edit note
  const handleEditNote = (note) => {
    setEditNote(note);
    setEditDialogOpen(true);
    setTimeout(() => {
      if (editEditorRef.current) editEditorRef.current.innerHTML = note.content;
    }, 0);
  };

  const handleSaveEdit = async () => {
    const content = editEditorRef.current.innerHTML;
    if (!content.trim() && !editImage) return;
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (editImage) formData.append("image", editImage);
      const res = await API.put(`/notes/${editNote._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedNotes = notes.map((n) =>
        n._id === editNote._id ? res.data : n
      );
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: "Note updated", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to update note",
        severity: "error",
      });
    }
  };

  // Delete note
  const handleDeleteNote = async () => {
    try {
      await API.delete(`/notes/${menuNoteId}`);
      const updatedNotes = notes.filter((n) => n._id !== menuNoteId);
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
      setSnackbar({ open: true, message: "Note deleted", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to delete note",
        severity: "error",
      });
    }
    setDeleteDialogOpen(false);
  };

  const openImageDialog = (src) => {
    setImageDialogSrc(src);
    setImageDialogOpen(true);
  };

  // Sorting / filtering
  const handleSort = (type) => {
    let sorted = [...notes];

    if (type === "recent") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
    } else if (type === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first
    } else if (type === "range") {
      sorted = notes.filter(
        (n) =>
          (!dateRange.from ||
            new Date(n.createdAt) >= new Date(dateRange.from)) &&
          (!dateRange.to || new Date(n.createdAt) <= new Date(dateRange.to))
      );
    }

    setFilteredNotes(sorted);
    setSortAnchorEl(null);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '100vh', py: 2 }}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontFamily: "Arial",
              display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ChecklistOutlinedIcon fontSize="medium" />
          Notes
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={(e) => setSortAnchorEl(e.currentTarget)}
          >
            Sort
          </Button>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => setSortAnchorEl(null)}
          >
            <MenuItem onClick={() => handleSort("recent")}>
              Newest First
            </MenuItem>
            <MenuItem onClick={() => handleSort("oldest")}>
              Oldest First
            </MenuItem>
            <MenuItem onClick={() => handleSort("range")}>
              By Date Range
            </MenuItem>
          </Menu>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setAddDialogOpen(true);
              setTimeout(() => {
                if (addEditorRef.current) addEditorRef.current.focus();
              }, 100);
            }}
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* Notes List */}
      <Paper
        elevation={4}
        sx={{
          height: { xs: 400, sm: 500 },
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflowY: "auto",
          p: 1,
        }}
      >
        {filteredNotes.length > 0 ? (
          <List>
            {filteredNotes.map((note) => (
              <ListItem
                key={note._id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "flex-start",
                  mb: 1,
                  borderBottom: "1px solid #eee",
                  pb: 1,
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <ListItemText
                    primary={
                      <span
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    }
                    secondary={new Date(note.createdAt).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  />
                </Box>

                {note.image && (
                  <Box
                    component="img"
                    src={`${BASE_URL}${note.image}`}
                    alt="note-img"
                    sx={{
                      width: { xs: "100%", sm: 100 },
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => openImageDialog(`${BASE_URL}${note.image}`)}
                  />
                )}

                {/* Edit/Delete Buttons */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton color="primary" onClick={() => handleEditNote(note)}>
                    <FiEdit color="#0077B5" size={20} />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setMenuNoteId(note._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <FiTrash2 color="#bb2124" size={20} />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
            <div ref={endOfListRef} />
          </List>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            No notes found!
          </Box>
        )}
      </Paper>

      {/* Add Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Toolbar */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" onClick={() => execCommand("bold", null, false)}>
              <b>B</b>
            </Button>
            <Button size="small" onClick={() => execCommand("underline", null, false)}>
              <u>U</u>
            </Button>
            <Button size="small" onClick={() => handleAddLink(false)}>
              Link
            </Button>
            <Button size="small" onClick={() => handleCopy(false)}>
              Copy
            </Button>
          </Box>

          <Box
            contentEditable
            suppressContentEditableWarning
            ref={addEditorRef}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              minHeight: 100,
              p: 1,
              overflowY: "auto",
            }}
          />

          <Button variant="outlined" component="label">
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                e.target.files[0] && setNewImage(e.target.files[0])
              }
            />
          </Button>
          {newImage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">{newImage.name}</Typography>
              <IconButton size="small" onClick={() => setNewImage(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button
            sx={{ bgcolor: "#bb2124", color: "#fff" }}
            onClick={() => setAddDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#0077B5" }}
            onClick={handleAddNote}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Toolbar */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" onClick={() => execCommand("bold")}>
              <b>B</b>
            </Button>
            <Button size="small" onClick={() => execCommand("underline")}>
              <u>U</u>
            </Button>
            <Button size="small" onClick={() => handleAddLink()}>
              Link
            </Button>
            <Button size="small" onClick={() => handleCopy()}>
              Copy
            </Button>
          </Box>

          <Box
            contentEditable
            suppressContentEditableWarning
            ref={editEditorRef}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              minHeight: 100,
              p: 1,
              overflowY: "auto",
            }}
          />

          <Button variant="outlined" component="label">
            Upload New Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                e.target.files[0] && setEditImage(e.target.files[0])
              }
            />
          </Button>
          {editImage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">{editImage.name}</Typography>
              <IconButton size="small" onClick={() => setEditImage(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#0077B5" }}
            onClick={handleSaveEdit}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this note?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteNote}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
      >
        <DialogContent
          sx={{
            position: "relative",
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          <IconButton
            onClick={() => setImageDialogOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.4)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={imageDialogSrc}
            alt="enlarged"
            sx={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
}

export default NotesPage;
