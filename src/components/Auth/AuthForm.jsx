import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Box, TextField, Button, Alert } from '@mui/material'

const AuthForm = ({ isLogin = true }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
    const { signIn, signUp, error, clearError } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        clearError()
        setShowConfirmationMessage(false)

        try {
            let result
            if (isLogin) {
                result = await signIn({ email, password })
            } else {
                result = await signUp({ email, password })
                if (!result.error) {
                    // Show confirmation message only on successful signup
                    setShowConfirmationMessage(true)
                }
            }

            if (result.error) {
                console.error('Auth error:', result.error)
            }
        } catch (error) {
            console.error('Unexpected error:', error)
        } finally {
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
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {showConfirmationMessage && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    ✅ Account created! Please check your email to confirm before signing in.
                </Alert>
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

export default AuthForm
