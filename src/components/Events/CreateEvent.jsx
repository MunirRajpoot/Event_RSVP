import React, { useState, useEffect } from "react";
import { useEvents } from "../../hooks/useEvents";
import { useNavigate, useParams } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

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
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {id ? "Edit Event" : "Create New Event"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                    multiline
                    rows={3}
                />
                <TextField
                    fullWidth
                    label="Event Date & Time"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={submitting}
                >
                    {submitting ? "Saving..." : id ? "Update Event" : "Create Event"}
                </Button>
            </Box>
        </Paper>
    );
};

export default CreateEvent;
