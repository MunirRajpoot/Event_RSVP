import React from "react";
import { Box, Paper, Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AuthForm from "./AuthForm";

const Login = () => {
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
                    Sign In
                </Typography>
                <AuthForm isLogin={true} />
                <Box sx={{ textAlign: 'center' }}>
                    <Link component={RouterLink} to="/signup" variant="body2">
                        Don't have an account? Sign Up
                    </Link>
                </Box>
            </Paper>
        </Box>
    )
}

export default Login;