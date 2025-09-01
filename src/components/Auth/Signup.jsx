import React from "react";
import { Box, Paper, Typography } from '@mui/material'
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
            </Paper>
        </Box>
    )
}

export default Signup;