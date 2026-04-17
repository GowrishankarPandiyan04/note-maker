import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Checkbox,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Button
} from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";

const TruncatedText = ({ text, limit = 40 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return "No Title";
  const isTruncated = text.length > limit;
  const displayText = expanded ? text : text.slice(0, limit);

  return (
    <>
      {displayText}
      {isTruncated && (
        <span
          style={{
            color: "rgba(0,0,0,0.6)",
            cursor: "pointer",
            marginLeft: "6px",
            fontSize: "0.85rem",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? " Show less" : "...more"}
        </span>
      )}
    </>
  );
};

function Liked() {
  const theme = useTheme();
  const [likedTopics, setLikedTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Fetch liked topics
  useEffect(() => {
    const fetchLikedTopics = async () => {
      try {
        const res = await API.get("/topics/liked", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const topics = res.data.filter(Boolean);
        setLikedTopics(topics);
        setFilteredTopics(topics);
      } catch (err) {
        console.error("Error fetching liked topics:", err);
      }
    };

    fetchLikedTopics();
  }, []);

  // Search logic
  useEffect(() => {
    const filtered = likedTopics.filter((topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Maintain current sort order
    let sorted = [...filtered];
    sorted.sort((a, b) =>
      sortAsc
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );
    setFilteredTopics(sorted);
  }, [searchTerm, likedTopics, sortAsc]);

  // Sort logic
  const handleSortByDate = () => {
    setSortAsc(!sortAsc);
  };

  // Like/unlike
  const handleLike = async (topicId) => {
    try {
      const res = await API.put(`/topics/${topicId}/like`);
      if (!res.data.liked) {
        setLikedTopics((prev) => prev.filter((t) => t._id !== topicId));
      } else {
        setLikedTopics((prev) =>
          prev.map((t) =>
            t && t._id === topicId
              ? { ...t, likesCount: res.data.likesCount, liked: res.data.liked }
              : t
          )
        );
      }
      setSnackbarMessage(res.data.liked ? "Liked!" : "Removed from liked!");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error liking topic:", err);
    }
  };

  // Save/unsave
  const handleSave = async (topicId) => {
    try {
      const res = await API.put(`/topics/${topicId}/save`);
      setLikedTopics((prev) =>
        prev.map((t) =>
          t && t._id === topicId
            ? { ...t, savesCount: res.data.savesCount, saved: res.data.saved }
            : t
        )
      );
      setSnackbarMessage(res.data.saved ? "Saved!" : "Removed from saved!");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error saving topic:", err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, minHeight: "100vh", backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc' }}>
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
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center", gap: 1, color: theme.palette.text.primary }}
        >
          <FavoriteOutlinedIcon color="error" />
          Liked Topics
        </Typography>

        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          onClick={handleSortByDate}
        >
          Sort
        </Button>
      </Box>

      {/* Search bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search liked topics..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "50px", backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff' } }}
      />

      <Grid container spacing={4} justifyContent="flex-start">
        {filteredTopics.length > 0 ? (
          filteredTopics.map(
            (topic) =>
              topic && (
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
                        overflow: "hidden",
                        color: theme.palette.text.primary,
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                        <TruncatedText text={topic.title || "No Title"} limit={30} />
                      </Typography>

                      <Box display="flex" mb={1} color={theme.palette.text.secondary}>
                        <Typography variant="body2">
                          Created At:{" "}
                          {new Date(topic.createdAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </Typography>
                      </Box>

                      <Box display="flex" color="text.secondary">
                        <Typography variant="body2">
                          Created By:{" "}
                          {topic.userId
                            ? `${topic.userId.firstName} ${topic.userId.lastName}`
                            : "Unknown"}
                        </Typography>
                      </Box>

                      <Box display="flex" mt={1} color="text.secondary">
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          Likes: {topic.likesCount || 0}
                        </Typography>
                        <Typography variant="body2">
                          Saves: {topic.savesCount || 0}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, justifyContent: "space-between" }}>
                      <Box>
                        <Checkbox
                          checked={topic.liked}
                          onChange={() => handleLike(topic._id)}
                          icon={<FavoriteBorder />}
                          checkedIcon={<Favorite color="error" />}
                          sx={{ mr: 1 }}
                        />
                        <Checkbox
                          checked={topic.saved}
                          onChange={() => handleSave(topic._id)}
                          icon={<BookmarkBorderIcon />}
                          checkedIcon={<BookmarkIcon color="primary" />}
                        />
                      </Box>

                      <Link
                        to={`/public/topics/${topic._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Typography
                          sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            backgroundColor: "#3d314a",
                            color: "#e0ddcf",
                            textAlign: "center",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#483b56ff" },
                          }}
                        >
                          View
                        </Typography>
                      </Link>
                    </CardActions>
                  </Card>
                </Grid>
              )
          )
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 4, mx: "auto", fontStyle: "italic" }}
          >
            No liked topics found!
          </Typography>
        )}
      </Grid>

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
}

export default Liked;
