import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRSVP } from '../../hooks/useRSVP'
import { supabase } from '../../lib/supabaseClient'
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material'
import LoadingSpinner from '../Common/LoadingSpinner'

const EventDetail = () => {
    const { id } = useParams()
    const [event, setEvent] = useState(null)
    const [rsvps, setRsvps] = useState([])
    const [userRsvp, setUserRsvp] = useState(null)
    const [loading, setLoading] = useState(true)
    const { updateRSVP, loading: rsvpLoading } = useRSVP()

    useEffect(() => {
        fetchEventDetails()

        // Subscribe to RSVP changes
        const subscription = supabase
            .channel('rsvps_changes')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'rsvps',
                    filter: `event_id=eq.${id}`
                },
                () => fetchRsvps()
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [id])

    const fetchEventDetails = async () => {
        try {
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single()

            if (eventError) throw eventError

            setEvent(eventData)
            await fetchRsvps()
        } catch (error) {
            console.error('Error fetching event details:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRsvps = async () => {
        try {
            const { data: rsvpsData, error: rsvpsError } = await supabase
                .from('rsvps')
                .select(`
          *,
          profiles:user_id(display_name)
        `)
                .eq('event_id', id)

            if (rsvpsError) throw rsvpsError

            setRsvps(rsvpsData || [])

            // Find current user's RSVP
            const currentUserRsvp = rsvpsData.find(
                rsvp => rsvp.user_id === supabase.auth.user()?.id
            )
            setUserRsvp(currentUserRsvp?.status || null)
        } catch (error) {
            console.error('Error fetching RSVPs:', error)
        }
    }

    const handleRsvp = async (status) => {
        const { error } = await updateRSVP(id, status)
        if (error) {
            console.error('Error updating RSVP:', error)
        } else {
            setUserRsvp(status)
        }
    }

    if (loading) return <LoadingSpinner />

    if (!event) {
        return (
            <Typography variant="h6" color="error">
                Event not found or you don't have access to it.
            </Typography>
        )
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'yes': return 'success'
            case 'no': return 'error'
            case 'maybe': return 'warning'
            default: return 'default'
        }
    }

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {event.title}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {event.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Date: {new Date(event.event_date).toLocaleString()}
                </Typography>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    RSVP to this event
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                        variant={userRsvp === 'yes' ? 'contained' : 'outlined'}
                        color="success"
                        onClick={() => handleRsvp('yes')}
                        disabled={rsvpLoading}
                    >
                        Yes
                    </Button>
                    <Button
                        variant={userRsvp === 'no' ? 'contained' : 'outlined'}
                        color="error"
                        onClick={() => handleRsvp('no')}
                        disabled={rsvpLoading}
                    >
                        No
                    </Button>
                    <Button
                        variant={userRsvp === 'maybe' ? 'contained' : 'outlined'}
                        color="warning"
                        onClick={() => handleRsvp('maybe')}
                        disabled={rsvpLoading}
                    >
                        Maybe
                    </Button>
                </Box>
                <Typography variant="body2">
                    Your current response: {userRsvp || 'Not responded yet'}
                </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Attendees ({rsvps.length})
                </Typography>
                <List>
                    {rsvps.map((rsvp, index) => (
                        <React.Fragment key={rsvp.user_id}>
                            <ListItem>
                                <ListItemText
                                    primary={rsvp.profiles?.display_name || 'Unknown User'}
                                    secondary={`Response: ${rsvp.status}`}
                                />
                                <Chip
                                    label={rsvp.status}
                                    color={getStatusColor(rsvp.status)}
                                    size="small"
                                />
                            </ListItem>
                            {index < rsvps.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
                {rsvps.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No one has responded yet.
                    </Typography>
                )}
            </Paper>
        </Box>
    )
}

export default EventDetail