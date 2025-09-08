// components/Events/UserSearchInvite.jsx
import React, { useState, useEffect } from "react";
import {
    Box,
    Autocomplete,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import { useEvents } from "../../hooks/useEvents";
import { supabase } from "../../lib/supabaseClient";

const UserSearchInvite = ({ eventId, onInviteAdded }) => {
    const { inviteUserToEvent, fetchInvites } = useEvents();
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [invitedUsers, setInvitedUsers] = useState([]);

    // Snackbar state
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

    // Load already invited users
    useEffect(() => {
        const loadInvites = async () => {
            const { invites } = await fetchInvites(eventId);
            setInvitedUsers((invites || []).map((i) => i.user_id));
        };
        loadInvites();
    }, [eventId]);

    // Fetch users when query >= 3 chars
    useEffect(() => {
        if (query.length < 3) return setOptions([]);

        const fetchUsers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("id, display_name")
                .ilike("display_name", `%${query}%`);

            if (!error) {
                // Filter out already invited users
                const filtered = (data || []).filter((u) => !invitedUsers.includes(u.id));
                setOptions(filtered);
            } else {
                console.error("❌ Error fetching users:", error.message);
            }
            setLoading(false);
        };

        fetchUsers();
    }, [query, invitedUsers]);

    // Handle user selection
    const handleSelect = async (user) => {
        if (!user) return;
        const result = await inviteUserToEvent(eventId, user.id);
        if (result.success) {
            setInvitedUsers((prev) => [...prev, user.id]);
            onInviteAdded?.(); // refresh parent list
            setQuery(""); // clear input

            setToast({ open: true, message: `${user.display_name} invited successfully!`, severity: "success" });
        } else {
            setToast({ open: true, message: `Failed to invite ${user.display_name}`, severity: "error" });
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Autocomplete
                options={options}
                getOptionLabel={(option) => option.display_name || ""}
                inputValue={query}
                onInputChange={(_, value) => setQuery(value)}
                onChange={(_, value) => handleSelect(value)}
                loading={loading}
                noOptionsText="No users found"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Invite users"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress size={16} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                fullWidth
            />

            {/* Toast notification */}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserSearchInvite;
