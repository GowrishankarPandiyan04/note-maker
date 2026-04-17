import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { useTheme } from "@mui/material/styles";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PublicOffOutlinedIcon from '@mui/icons-material/PublicOffOutlined';

const BASE_URL = process.env.REACT_APP_API_URL;

function PublicTopicPage() {
  const theme = useTheme();
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [filteredNotes, setFilteredNotes] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogSrc, setImageDialogSrc] = useState("");

  // Fetch topic and notes
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await API.get(`/topics/public/${topicId}`);
        setTopic(res.data.topic);
        const sortedNotes = res.data.notes.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setFilteredNotes(sortedNotes);
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Failed to load topic or notes", severity: "error" });
      }
    };
    fetchTopic();
  }, [topicId]);


  if (!topic)
  return (
    <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Box
          sx={{
            p: 5,
            borderRadius: 3,
            backgroundColor: "#fcdcdc", // light error background
            border: "1px solid #f28b82", // soft red border
            color: "#2d232e", // your main palette for text
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 2 }}
          >
            <PublicOffOutlinedIcon fontSize="medium" /> {" "}
            Topic Unavailable !
          </Typography>

          <Typography variant="body1" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
            This topic has been unpublished by the user. <br />
            You will be able to view it once it is published again !.
          </Typography>
        </Box>
      </Container>
    </Box>
  );



  const openImageDialog = (src) => {
    setImageDialogSrc(src);
    setImageDialogOpen(true);
  };

  const closeImageDialog = () => {
    setImageDialogOpen(false);
    setImageDialogSrc("");
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Topic Header */}
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: theme.palette.text.primary }}>
          {topic.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Created At: {new Date(topic.createdAt).toLocaleDateString("en-GB")} | Created By:{" "}
          {topic.userId
            ? `${topic.userId.firstName} ${topic.userId.lastName}`
            : "Unknown"}
        </Typography>

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
          mt: 3,
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
                    primary={<span dangerouslySetInnerHTML={{ __html: note.content }} />}
                    secondary={
                      <>
                        {new Date(note.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        {/* {" | "}By: {note.userId ? `${note.userId.firstName} ${note.userId.lastName}` : "Unknown"} */}
                      </>
                    }
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
              </ListItem>
            ))}
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

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={closeImageDialog} maxWidth="md">
        <DialogContent sx={{ position: "relative", p: 0, backgroundColor: "transparent" }}>
          <IconButton
            onClick={closeImageDialog}
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
            sx={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 1 }}
          />
        </DialogContent>
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

export default PublicTopicPage;
