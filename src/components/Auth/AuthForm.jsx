import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Box, TextField, Button, Typography } from '@mui/material'

const AuthForm = ({ isLogin = true }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signIn, signUp } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const { error } = isLogin
                ? await signIn({ email, password })
                : await signUp({ email, password })

            if (error) throw error
        }
        catch (error) {
            setError(error.message)
        }
        finally{
            setLoading(false)
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
            >
                {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
        </Box>
    )
}

export default AuthForm;