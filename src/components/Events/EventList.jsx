import React from 'react'
import { useEvents } from '../../hooks/useEvents'
import { Box, Typography, Card, CardContent, Button, Chip } from '@mui/material'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../Common/LoadingSpinner.jsx'
import { supabase } from '../../lib/supabaseClient'

const EventList = () => {
    const { events, loading } = useEvents()

    const getRSVPCount = (event, status) => {
        return event.rsvps?.filter(rsvp => rsvp.status === status).length || 0
    }

    if (loading) return <LoadingSpinner />

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                My Events
            </Typography>
            <Button
                component={Link}
                to="/create-event"
                variant="contained"
                sx={{ mb: 3 }}
            >
                Create New Event
            </Button>
            {events.length === 0 ? (
                <Typography>No events found. Create one or get invited!</Typography>
            ) : (
                events.map((event) => (
                    <Card key={event.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">{event.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(event.event_date).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {event.description}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Chip
                                    label={`Yes: ${getRSVPCount(event, 'yes')}`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`No: ${getRSVPCount(event, 'no')}`}
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Maybe: ${getRSVPCount(event, 'maybe')}`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                />
                            </Box>
                            <Button
                                component={Link}
                                to={`/event/${event.id}`}
                                variant="outlined"
                                sx={{ mt: 2 }}
                            >
                                View Details
                            </Button>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    )
}

export default EventList