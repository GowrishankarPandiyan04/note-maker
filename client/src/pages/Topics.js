import * as React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  useMediaQuery,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';

function TopicsPage() {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [topics, setTopics] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [newTopic, setNewTopic] = React.useState("");
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editTopic, setEditTopic] = React.useState(null);
  const [editTitle, setEditTitle] = React.useState("");

  // Delete confirmation dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTopicId, setDeleteTopicId] = React.useState(null);

  // Publish confirmation dialog state
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [publishTopic, setPublishTopic] = React.useState(null);

  // Fetch topics
  React.useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await API.get(`/topics/${subjectId}`);
        setTopics(res.data);
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Failed to load topics",
          severity: "error",
        });
      }
    };
    fetchTopics();
  }, [subjectId]);

  // Add topic
  const handleAddTopic = async () => {
    if (!newTopic.trim()) return;
    try {
      const res = await API.post(`/topics/${subjectId}`, { title: newTopic });
      setTopics([res.data, ...topics]);
      setNewTopic("");
      setSnackbar({ open: true, message: "Topic added", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to add topic", severity: "error" });
    }
  };

  // Edit topic
  const handleOpenEdit = (topic) => {
    setEditTopic(topic);
    setEditTitle(topic.title);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditTopic(null);
    setEditTitle("");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    try {
      const res = await API.put(`/topics/${editTopic._id}`, { title: editTitle });
      setTopics(topics.map((t) => (t._id === editTopic._id ? res.data : t)));
      setSnackbar({ open: true, message: "Topic updated", severity: "success" });
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to update topic", severity: "error" });
    }
  };

  // Delete topic
  const handleOpenDelete = (topicId) => {
    setDeleteTopicId(topicId);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteTopicId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/topics/${deleteTopicId}`);
      setTopics(topics.filter((t) => t._id !== deleteTopicId));
      setSnackbar({ open: true, message: "Topic deleted", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete topic", severity: "error" });
    } finally {
      handleCloseDelete();
    }
  };

  // Open publish confirmation dialog
  const handleOpenPublishDialog = (topic) => {
    setPublishTopic(topic);
    setPublishDialogOpen(true);
  };

  const handleClosePublishDialog = () => {
    setPublishDialogOpen(false);
    setPublishTopic(null);
  };

  // Confirm publish/unpublish
  const handleConfirmPublish = async () => {
    try {
      const res = await API.put(`/topics/${publishTopic._id}/publish`, {
        published: !publishTopic.published,
      });
      setTopics(topics.map((t) => (t._id === publishTopic._id ? res.data.topic : t)));
      setSnackbar({
        open: true,
        message: `Topic ${res.data.topic.published ? "published" : "unpublished"}`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to update publish status", severity: "error" });
    } finally {
      handleClosePublishDialog();
    }
  };

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '100vh', py: 2 }}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2, px: isMobile ? 1 : 3 }}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontFamily: "Arial",
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: isMobile ? "center" : "flex-start",
            color: theme.palette.text.primary,
          }}
        >
          <TopicOutlinedIcon fontSize="medium" />
          Topics
        </Typography>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search topics..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
      />

      {/* Topics List */}
      <Grid container spacing={4} justifyContent="flex-start" sx={{ mb: 4 }}>
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={topic._id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                sx={{
                  minHeight: 180,
                  width: 325,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                  transition: "0.3s",
                  "&:hover": { 
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
                      : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    transform: "translateY(-5px)" 
                  },
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                    color: theme.palette.text.primary,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/topics/${topic._id}/notes`)}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                    {topic.title}
                  </Typography>

                  <Box display="flex" mb={1} color={theme.palette.text.secondary}>
                    <Typography variant="body2">
                      Created At:{" "}
                      {new Date(topic.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, justifyContent: "space-between", borderTop: "1px solid", borderColor: theme.palette.divider }}>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" color="primary" onClick={() => navigate(`/topics/${topic._id}/notes`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color={topic.published ? "success" : "default"}
                      onClick={() => handleOpenPublishDialog(topic)}
                      title={topic.published ? "Unpublish" : "Publish"}
                    >
                      {topic.published ? <UnpublishedIcon fontSize="small" /> : <PublishIcon fontSize="small" />}
                    </IconButton>

                    <IconButton size="small" color="secondary" onClick={() => handleOpenEdit(topic)}>
                      <FiEdit color="#1976d2" size={18} />
                    </IconButton>

                    <IconButton size="small" color="error" onClick={() => handleOpenDelete(topic._id)}>
                      <FiTrash2 color="#bb2124" size={18} />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              fontStyle: "italic",
              width: "100%",
              mt: 4
            }}
          >
            No topics found!
          </Box>
        )}
      </Grid>

      {/* Add Topic */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          gap: 1,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Enter new topic..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTopic();
            }
          }}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddTopic}
          startIcon={<AddIcon />}
          sx={{ minWidth: "150px", borderRadius: "50px", textTransform: "none", borderWidth: 2, "&:hover": { borderWidth: 2 } }}
        >
          ADD TOPIC
        </Button>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle>Edit Topic</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Topic Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: "#0077B5" }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this topic? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Publish/Unpublish Confirmation Dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={handleClosePublishDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>{publishTopic?.published ? "Unpublish Topic" : "Publish Topic"}</DialogTitle>
        <DialogContent>
          {publishTopic?.published
            ? "Are you sure you want to unpublish this topic? Users will no longer be able to see it."
            : "If you publish this topic, all users will be able to see it. Are you sure you want to publish?"}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button onClick={handleClosePublishDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmPublish}
            variant="contained"
            color={publishTopic?.published ? "error" : "success"}
          >
            {publishTopic?.published ? "Unpublish" : "Publish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      </Container>
    </Box>
  );
}

export default TopicsPage;
