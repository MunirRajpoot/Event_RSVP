import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink } from 'react-router-dom'

const Navbar = () => {
    const { user, signOut } = useAuth()
    const [open, setOpen] = useState(false)

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (error) {
            console.log('Error Signing Out:', error)
        }
    }

    const menuItems = [
        { label: 'Events', path: '/' },
        { label: 'Create Event', path: '/create-event' },
    ]

    return (
        <>
            <AppBar
                position="static"
                sx={{
                    bgcolor: '#2C2C2C',
                    boxShadow: 'none',
                    borderBottom: '1px solid #444'
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: 600 }}
                    >
                        Event RSVP
                    </Typography>

                    {/* Desktop Menu */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.label}
                                component={RouterLink}
                                to={item.path}
                                sx={{ color: '#E0E0E0', '&:hover': { color: '#fff' } }}
                            >
                                {item.label}
                            </Button>
                        ))}
                        {user && (
                            <Button
                                onClick={handleSignOut}
                                sx={{ color: '#FF6B6B', '&:hover': { color: '#FF4C4C' } }}
                            >
                                Sign Out
                            </Button>
                        )}
                    </Box>

                    {/* Mobile Menu Button */}
                    <IconButton
                        sx={{ display: { xs: 'flex', md: 'none' }, color: '#E0E0E0' }}
                        onClick={() => setOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <Box sx={{ width: 250, bgcolor: '#2C2C2C', height: '100%', color: '#E0E0E0' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        {user && (
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => { handleSignOut(); setOpen(false) }}
                                    sx={{backgroundColor:"grey"}}
                                    >
                                    <ListItemText
                                        primary="Sign Out"
                                    
                                    />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Drawer>
        </>
    )
}
export default Navbar
