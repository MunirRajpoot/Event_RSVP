// components/Events/EventDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
} from "@mui/material";
import LoadingSpinner from "../Common/LoadingSpinner.jsx";
import UserSearchInvite from "./UserSearchInvite.jsx";

const EventDetail = () => {
    const { id } = useParams();
    const { events, loading, fetchInvites, removeInvite } = useEvents();
    const event = events.find((e) => e.id === id);

    const [invites, setInvites] = useState([]);
    const [loadingInvites, setLoadingInvites] = useState(true);

    useEffect(() => {
        if (event) {
            loadInvites();
        }
    }, [event]);

    const loadInvites = async () => {
        setLoadingInvites(true);
        const { invites, error } = await fetchInvites(event.id);
        if (!error) setInvites(invites);
        setLoadingInvites(false);
    };

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
        <Box>
            <Typography variant="h4" gutterBottom>{event.title}</Typography>
            <Typography>{event.description}</Typography>
            <Typography sx={{ mb: 2 }}>
                {new Date(event.event_date).toLocaleString()}
            </Typography>

            {/* Invite Users */}
            <UserSearchInvite eventId={event.id} />

            <Divider sx={{ my: 2 }} />

            {/* Already invited users */}
            <Typography variant="h6">Invited Users</Typography>
            {loadingInvites ? (
                <LoadingSpinner />
            ) : invites.length === 0 ? (
                <Typography>No users invited yet.</Typography>
            ) : (
                <List>
                    {invites.map((invite) => (
                        <ListItem
                            key={invite.id}
                            secondaryAction={
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleRemoveInvite(invite.id)}
                                >
                                    Remove
                                </Button>
                            }
                        >
                            <ListItemText
                                primary={invite.profiles?.display_name || "Unknown"}
                                secondary={invite.role}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default EventDetail;
