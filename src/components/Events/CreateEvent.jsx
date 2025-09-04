import React, { useState } from "react";
import { useEvents } from "../../hooks/useEvents";
import { useNavigate } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
} from "@mui/material";

const CreateEvent = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { createEvent } = useEvents();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const { event, error } = await createEvent({
            title,
            description,
            event_date: eventDate,
        });

        if (error) {
            console.error("❌ Error creating event:", error.message);
        } else {
            console.log("✅ Event created:", event);

            // clear form
            setTitle("");
            setDescription("");
            setEventDate("");

            navigate("/");
        }

        setSubmitting(false);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Create New Event
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
                    {submitting ? "Creating..." : "Create Event"}
                </Button>
            </Box>
        </Paper>
    );
};

export default CreateEvent;
