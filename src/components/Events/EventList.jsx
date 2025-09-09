import React from "react";
import { useEvents } from "../../hooks/useEvents";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../Common/LoadingSpinner";

const EventList = () => {
    const { events, loading, deleteEvent } = useEvents();
    const navigate = useNavigate();

    const getRSVPCount = (event, status) =>
        event.rsvps?.filter((rsvp) => rsvp.status === status).length || 0;

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            const result = await deleteEvent(id);
            if (result.error) {
                alert("Failed to delete event: " + result.error.message);
            } else {
                alert("Event deleted!");
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            {events.length === 0 ? (
                <Typography>No events found. Create one or get invited!</Typography>
            ) : (
                events.map((event) => (
                    <Card
                        key={event.id}
                        sx={{
                            mb: 2,
                            borderRadius: 3,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                               background: "#3F51B5",
                                color: "white",
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {event.title}
                            </Typography>
                            <Typography variant="body2">
                                {new Date(event.event_date).toLocaleString()}
                            </Typography>
                        </Box>

                        <CardContent>
                            <Typography
                                variant="body2"
                                sx={{ mb: 2, color: "text.secondary" }}
                            >
                                {event.description}
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                <Chip label={`Yes: ${getRSVPCount(event, "yes")}`} size="small" />
                                <Chip label={`No: ${getRSVPCount(event, "no")}`} size="small"  />
                                <Chip label={`Maybe: ${getRSVPCount(event, "maybe")}`} size="small"  />
                            </Box>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{ borderRadius: 50, textTransform: "none" }}
                                    component={Link}
                                    to={`/event/${event.id}`}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ borderRadius: 50, textTransform: "none" }}
                                    onClick={() => navigate(`/edit-event/${event.id}`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    sx={{ borderRadius: 50, textTransform: "none" }}
                                    onClick={() => handleDelete(event.id)}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
};

export default EventList;
