import React, { useEffect, useState } from "react";
import { useEvents } from "../../hooks/useEvents";
import { useRSVP } from "../../hooks/useRSVP";
import { useComments } from "../../hooks/useComments";
import { supabase } from "../../lib/supabaseClient";
import PopupCommentModal from "./PopupCommentModal";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
} from "@mui/material";
import LoadingSpinner from "../Common/LoadingSpinner";

const MyInvites = () => {
    const { fetchInvitedEvents } = useEvents();
    const { updateRSVP, rsvpLoading } = useRSVP();
    const { addComment, fetchComments, loading: commentsLoading } = useComments();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Popup states
    const [openModalFor, setOpenModalFor] = useState(null);
    const [modalText, setModalText] = useState("");
    const [eventComments, setEventComments] = useState({});
    const [loadingCommentsFor, setLoadingCommentsFor] = useState(null);

    useEffect(() => {
        loadInvitedEvents();

        const channel = supabase
            .channel("rsvp_changes")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "rsvps" },
                (payload) => {
                    const { event_id, status } = payload.new;
                    if (status === "yes") {
                        setEvents((prev) => prev.filter((e) => e.id !== event_id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
            if (status === "yes") {
                setEvents((prev) => prev.filter((e) => e.id !== eventId));
            }
            alert(`RSVP updated: ${status}`);
        } else {
            alert("Failed to update RSVP");
        }
    };

    // ✅ Open modal + load comments
    const handleOpenComments = async (eventId) => {
        setOpenModalFor(eventId);
        setLoadingCommentsFor(eventId);
        const { data, error } = await fetchComments(eventId);
        if (!error) {
            setEventComments((prev) => ({ ...prev, [eventId]: data }));
        }
        setLoadingCommentsFor(null);
    };

    // ✅ Submit new comment inside modal
    const handleModalSubmit = async () => {
        if (!modalText.trim() || !openModalFor) return;
        const { data, error } = await addComment(openModalFor, modalText);
        if (!error && data) {
            setEventComments((prev) => ({
                ...prev,
                [openModalFor]: [data, ...(prev[openModalFor] || [])],
            }));
            setModalText("");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            {events.length === 0 ? (
                <Typography>You have no invited events.</Typography>
            ) : (
                events.map((event) => (
                    <Card key={event.id} sx={{ mb: 2, borderRadius: 3 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                background: "#3F51B5",
                                color: "white",
                            }}
                        >
                            <Typography variant="h6">{event.title}</Typography>
                            <Typography variant="body2">
                                {new Date(event.event_date).toLocaleString()}
                            </Typography>
                        </Box>

                        <CardContent>
                            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
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

                            {/* Open Comments Modal */}
                            <Button
                                sx={{ mt: 2 }}
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenComments(event.id)}
                            >
                                View Comments
                            </Button>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Popup Modal */}
            <PopupCommentModal
                open={!!openModalFor}
                onClose={() => {
                    setOpenModalFor(null);
                    setModalText("");
                }}
                onSubmit={handleModalSubmit}
                commentText={modalText}
                setCommentText={setModalText}
                comments={eventComments[openModalFor] || []}
                loading={commentsLoading && loadingCommentsFor === openModalFor}
            />
        </Box>
    );
};

export default MyInvites;
