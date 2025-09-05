import React, { useEffect, useState } from "react";
import { useEvents } from "../../hooks/useEvents";
import { useRSVP } from "../../hooks/useRSVP";
import { useComments } from "../../hooks/useComments";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    TextField,
} from "@mui/material";
import LoadingSpinner from "../Common/LoadingSpinner";

const MyInvites = () => {
    const { fetchInvitedEvents } = useEvents();
    const { updateRSVP, rsvpLoading } = useRSVP();
    const { addComment, fetchComments, loading: commentsLoading } = useComments();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState({});
    const [eventComments, setEventComments] = useState({});

    useEffect(() => {
        loadInvitedEvents();
    }, []);

    const loadInvitedEvents = async () => {
        setLoading(true);
        const invitedEvents = await fetchInvitedEvents();
        setEvents(invitedEvents || []);
        setLoading(false);
    };

    const handleRSVP = async (eventId, status) => {
        const { error } = await updateRSVP(eventId, status);
        if (!error) {
            alert(`RSVP updated: ${status}`);
        } else {
            alert("Failed to update RSVP");
        }
    };

    const handleAddComment = async (eventId) => {
        if (!commentText[eventId]) return;
        const { data, error } = await addComment(eventId, commentText[eventId]);
        if (!error) {
            setEventComments((prev) => ({
                ...prev,
                [eventId]: [data, ...(prev[eventId] || [])],
            }));
            setCommentText((prev) => ({ ...prev, [eventId]: "" }));
        }
    };

    const loadComments = async (eventId) => {
        const { data, error } = await fetchComments(eventId);
        if (!error) {
            setEventComments((prev) => ({ ...prev, [eventId]: data }));
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                My Invites
            </Typography>

            {events.length === 0 ? (
                <Typography>You have no invited events.</Typography>
            ) : (
                events.map((event) => (
                    <Card key={event.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">{event.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(event.event_date).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {event.description}
                            </Typography>

                            {/* RSVP Buttons */}
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                {["yes", "no", "maybe"].map((status) => (
                                    <Button
                                        key={status}
                                        variant="outlined"
                                        disabled={rsvpLoading}
                                        onClick={() => handleRSVP(event.id, status)}
                                    >
                                        {status.toUpperCase()}
                                    </Button>
                                ))}
                            </Stack>

                            {/* Comment Input */}
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Write a comment..."
                                    value={commentText[event.id] || ""}
                                    onChange={(e) =>
                                        setCommentText((prev) => ({
                                            ...prev,
                                            [event.id]: e.target.value,
                                        }))
                                    }
                                />
                                <Button
                                    sx={{ mt: 1 }}
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleAddComment(event.id)}
                                    disabled={!commentText[event.id]}
                                >
                                    Add Comment
                                </Button>
                            </Box>

                            {/* Comments List */}
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    size="small"
                                    onClick={() => loadComments(event.id)}
                                    disabled={commentsLoading}
                                >
                                    Load Comments
                                </Button>
                                {eventComments[event.id]?.map((c) => (
                                    <Typography key={c.id} variant="body2" sx={{ mt: 1 }}>
                                        <b>{c.profiles?.display_name || "User"}:</b> {c.content}
                                    </Typography>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
};

export default MyInvites;
