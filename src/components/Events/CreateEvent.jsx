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
    const { createEvent } = useEvents();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        debugger
        e.preventDefault();

        console.log("📤 Creating event:", { title, description, event_date: eventDate });

        const { event, error } = await createEvent({
            title,
            description,
            event_date: eventDate, // ✅ correct column name
        });

        if (error) {
            alert("❌ Error creating event: " + error.message);
        } else {
            console.log("✅ Event created:", event);
            navigate("/");
        }
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
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Create Event
                </Button>
            </Box>
        </Paper>
    );
};

export default CreateEvent;
