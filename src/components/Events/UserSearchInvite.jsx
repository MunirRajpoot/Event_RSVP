// components/Events/UserSearchInvite.jsx
import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import { useEvents } from "../../hooks/useEvents";

const UserSearchInvite = ({ eventId }) => {
    const { inviteUserToEvent } = useEvents();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search profiles by display_name
    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("profiles")
            .select("id, display_name")
            .ilike("display_name", `%${query}%`); // case-insensitive search

        if (error) {
            console.error("❌ Error searching users:", error.message);
        } else {
            setResults(data || []);
        }
        setLoading(false);
    };

    // Invite selected user
    const handleInvite = async (userId) => {
        const result = await inviteUserToEvent(eventId, userId);
        if (result.error) {
            alert("❌ Failed to invite: " + result.error.message);
        } else {
            alert("✅ User invited successfully!");
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Invite Users</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField
                    label="Search by Name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={handleSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </Button>
            </Box>

            <List>
                {results.map((user) => (
                    <ListItem
                        key={user.id}
                        secondaryAction={
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleInvite(user.id)}
                            >
                                Invite
                            </Button>
                        }
                    >
                        <ListItemText primary={user.display_name} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default UserSearchInvite;
