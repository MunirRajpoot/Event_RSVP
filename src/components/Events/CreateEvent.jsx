import React, { useState, useEffect } from "react";
import { useEvents } from "../../hooks/useEvents";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardContent,
    Divider,
} from "@mui/material";

const CreateEvent = () => {
    const { events, createEvent, updateEvent } = useEvents();
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            const event = events.find((e) => e.id === id);
            if (event) {
                setTitle(event.title);
                setDescription(event.description || "");
                setEventDate(event.event_date?.slice(0, 16));
            }
        }
    }, [id, events]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const eventData = { title, description, event_date: eventDate };

        let result;
        if (id) {
            result = await updateEvent(id, eventData);
        } else {
            result = await createEvent(eventData);
        }

        if (result.error) {
            console.error("❌ Error saving event:", result.error.message);
        } else {
            navigate("/");
        }

        setSubmitting(false);
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // mt: 5,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 600,
                    borderRadius: 3,
                    boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                        color: "#fff",
                        p: 3,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        {id ? "Edit Event" : "Create New Event"}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {id
                            ? "Update the details of your event."
                            : "Fill in the details to create a new event."}
                    </Typography>
                </Box>

                {/* Form */}
                <CardContent sx={{ p: 4 }}>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                        <TextField
                            fullWidth
                            label="Event Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            variant="outlined"
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            variant="outlined"
                        />

                        <TextField
                            fullWidth
                            label="Event Date & Time"
                            type="datetime-local"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                            variant="outlined"
                        />

                        {/* <Divider sx={{ my: 2 }} /> */}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: "1rem",
                                background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #4338ca, #2563eb)",
                                },
                            }}
                            disabled={submitting}
                        >
                            {submitting
                                ? "Saving..."
                                : id
                                ? "Update Event"
                                : "Create Event"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateEvent;
