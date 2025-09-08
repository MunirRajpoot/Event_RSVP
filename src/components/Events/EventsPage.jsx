import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import EventList from "./EventList";
import MyInvites from "./MyInvites";
import RSVPEvents from "./RSVPEvents";

const EventsPage = () => {
    return (
        <Box
            sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", md: "row" }, // stack on mobile, row on desktop
                height: "100%",
            }}
        >
            {/* Column 1 - My Events */}
            <Box sx={{ flex: 1, display: "flex" }}>
                <Paper
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 2, textAlign:"center" }}
                    >
                        My Events
                    </Typography>
                    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                        <EventList />
                    </Box>
                </Paper>
            </Box>

            {/* Column 2 - My Invites */}
            <Box sx={{ flex: 1, display: "flex" }}>
                <Paper
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 2, textAlign:"center"}}
                    >
                        My Invites
                    </Typography>
                    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                        <MyInvites />
                    </Box>
                </Paper>
            </Box>

            {/* Column 3 - RSVP’d Events */}
            <Box sx={{ flex: 1, display: "flex" }}>
                <Paper
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 2, textAlign:"center" }}
                    >
                        RSVP’d Events
                    </Typography>
                    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                        <RSVPEvents />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default EventsPage;
