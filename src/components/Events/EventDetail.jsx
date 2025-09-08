// components/Events/EventDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import {
    Box,
    Typography,
    Stack,
    Divider,
    Paper,
    Chip,
    Avatar,
} from "@mui/material";
import LoadingSpinner from "../Common/LoadingSpinner.jsx";
import UserSearchInvite from "./UserSearchInvite.jsx";

const EventDetail = () => {
    const { id } = useParams();
    const { events, loading, fetchInvites, removeInvite } = useEvents();
    const event = events.find((e) => e.id === id);

    const [invites, setInvites] = useState([]);
    const [loadingInvites, setLoadingInvites] = useState(true);

    // Load invites whenever event changes
    useEffect(() => {
        if (event) loadInvites();
    }, [event]);

    // Load invited users
    const loadInvites = async () => {
        setLoadingInvites(true);
        const { invites, error } = await fetchInvites(event.id);
        if (!error) setInvites(invites);
        setLoadingInvites(false);
    };

    // Remove invite
    const handleRemoveInvite = async (inviteId) => {
        if (!window.confirm("Remove this invite?")) return;
        const result = await removeInvite(inviteId);
        if (result.success) {
            setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
        } else {
            alert("❌ Failed to remove invite");
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!event) return <Typography>Event not found</Typography>;

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
            {/* Event Info Card */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    {event.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    {event.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {new Date(event.event_date).toLocaleString()}
                </Typography>
            </Paper>

            {/* Invite Users */}
            <UserSearchInvite
                eventId={event.id}
                onInviteAdded={loadInvites} // Refresh invites instantly
            />

            <Divider sx={{ my: 3 }} />

            {/* Invited Users */}
            <Typography variant="h6" sx={{ mb: 1 }}>
                Invited Users
            </Typography>

            {loadingInvites ? (
                <LoadingSpinner />
            ) : invites.length === 0 ? (
                <Typography color="text.secondary">No users invited yet.</Typography>
            ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {invites.map((invite) => (
                        <Chip
                            key={invite.id}
                            label={invite.profiles?.display_name || "Unknown"}
                            avatar={<Avatar>{invite.profiles?.display_name?.[0]}</Avatar>}
                            onDelete={() => handleRemoveInvite(invite.id)}
                            color="primary"
                            sx={{ mb: 1 }}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default EventDetail;
