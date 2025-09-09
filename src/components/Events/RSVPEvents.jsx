import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
} from "@mui/material";
import LoadingSpinner from "../Common/LoadingSpinner";
import { useRSVP } from "../../hooks/useRSVP";
import { useComments } from "../../hooks/useComments";
import { supabase } from "../../lib/supabaseClient";
import PopupCommentModal from "./PopupCommentModal";

const RSVPEvents = () => {
    const { fetchRSVPEvents } = useRSVP();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const { addComment, fetchComments, loading: commentsLoading } = useComments();
    const [eventComments, setEventComments] = useState({});
    const [openModalFor, setOpenModalFor] = useState(null);
    const [modalText, setModalText] = useState("");

    useEffect(() => {
        loadRSVPEvents();

        const rsvpChannel = supabase
            .channel("rsvp_events_changes")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "rsvps" },
                async (payload) => {
                    const { event_id, status } = payload.new;
                    if (status === "yes") {
                        const rsvpEvents = await fetchRSVPEvents();
                        setEvents(rsvpEvents || []);
                    } else {
                        setEvents((prev) => prev.filter((e) => e.id !== event_id));
                    }
                }
            )
            .subscribe();

        const commentsChannel = supabase
            .channel("comments_changes")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "comments" },
                (payload) => {
                    const newComment = payload.new;
                    setEventComments((prev) => ({
                        ...prev,
                        [newComment.event_id]: [...(prev[newComment.event_id] || []), newComment],
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(rsvpChannel);
            supabase.removeChannel(commentsChannel);
        };
    }, []);

    const loadRSVPEvents = async () => {
        setLoading(true);
        const rsvpEvents = await fetchRSVPEvents();
        setEvents(rsvpEvents || []);
        setLoading(false);
    };

    const handleLoadComments = async (eventId) => {
        const { data, error } = await fetchComments(eventId);
        if (!error) {
            setEventComments((prev) => ({ ...prev, [eventId]: data }));
        }
    };

    const handleModalSubmit = async () => {
        if (!modalText.trim()) return;
        const { data, error } = await addComment(openModalFor, modalText);
        if (!error && data) {
            setEventComments((prev) => ({
                ...prev,
                [openModalFor]: [...(prev[openModalFor] || []), data],
            }));
            setModalText("");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            {events.length === 0 ? (
                <Typography>No RSVP’d events yet.</Typography>
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

                            {/* RSVP status */}
                            <Chip
                                label={`RSVP: ${event.status}`}
                                color={
                                    event.status === "yes"
                                        ? "none"
                                        : event.status === "maybe"
                                            ? "warning"
                                            : "error"
                                }
                                sx={{ borderRadius: 50 }}
                            />

                            {/* View Comments Button */}
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={async () => {
                                        await handleLoadComments(event.id);
                                        setOpenModalFor(event.id);
                                    }}
                                    disabled={commentsLoading && openModalFor === event.id}
                                >
                                    View Comments
                                </Button>
                            </Box>
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
                loading={commentsLoading}
            />
        </Box>
    );
};

export default RSVPEvents;
