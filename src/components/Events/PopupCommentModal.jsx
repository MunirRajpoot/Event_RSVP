import React, { useEffect, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const PopupCommentModal = ({
    open,
    onClose,
    onSubmit,
    commentText,
    setCommentText,
    comments = [],
    loading,
}) => {
    const bottomRef = useRef(null);

    // ✅ Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                Comments
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    maxHeight: "400px",
                    overflowY: "auto",
                    bgcolor: "#fafafa",
                    p: 1,
                }}
            >
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : comments.length === 0 ? (
                    <Typography>No comments yet.</Typography>
                ) : (
                    comments.map((comment) => (
                        <Box
                            key={comment.id}
                            sx={{
                                p: 1.2,
                                borderRadius: "16px",
                                backgroundColor: "#f1f1f1",
                                alignSelf: "flex-start",
                                maxWidth: "75%",
                                textAlign: "left",
                                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)", // ✅ bubble shadow
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 0.3 }}
                            >
                                {comment.profiles?.display_name || "Unknown"}
                            </Typography>
                            <Typography variant="body2">{comment.content}</Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    fontSize: "0.7rem",
                                    display: "block",
                                    mt: 0.5,
                                }}
                            >
                                {new Date(comment.created_at).toLocaleString()}
                            </Typography>
                        </Box>
                    ))
                )}
                <div ref={bottomRef} />
            </DialogContent>

            {/* Input field */}
            <DialogActions sx={{ display: "flex", gap: 1, p: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    sx={{
                        backgroundColor: "#fff",
                        borderRadius: "20px",
                    }}
                />
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={!commentText.trim()}
                    sx={{ borderRadius: "20px" }}
                >
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PopupCommentModal;
