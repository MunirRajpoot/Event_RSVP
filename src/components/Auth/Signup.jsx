import React from "react";
import { Box, Paper, Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AuthForm from "./AuthForm";

const Signup = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                bgcolor: 'grey.100'
            }}
        >
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    Sign Up
                </Typography>
                <AuthForm isLogin={false} />
                <Box sx={{ textAlign: 'center' }}>
                    <Link component={RouterLink} to="/" variant="body2">
                        Already have an account? Sign In
                    </Link>
                </Box>
            </Paper>
        </Box>
    )
}

export default Signup;