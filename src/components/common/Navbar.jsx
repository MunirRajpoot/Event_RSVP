import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const Navbar = () => {
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        try {
            await signOut();

        } catch (error) {
            console.log('Error Signing Out:', error);

        }
    }
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Event RSVP
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" component={RouterLink} to="/">
                        Events
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/create-event">
                        Create Event
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/my-invites">
                        My Invites
                    </Button>
                    {user && (
                        <Button color="inherit" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    )
}
export default Navbar