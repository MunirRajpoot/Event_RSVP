import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Box, TextField, Button, Alert, IconButton, InputAdornment } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from "react-router-dom";


const AuthForm = ({ isLogin = true }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
    const { signIn, signUp, error, clearError } = useAuth()
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        clearError()
        setShowConfirmationMessage(false)

        try {
            let result
            if (isLogin) {
                // Login case
                result = await signIn({ email, password })
                if (!result.error) {
                    navigate("/") // redirect to homepage
                }
            } else {
                // 🔹 Signup case
                result = await signUp({ email, password })
                if (!result.error) {
                    // auto login right after signup
                    const loginResult = await signIn({ email, password })
                    if (!loginResult.error) {
                        navigate("/") // redirect to homepage
                    } else {
                        // fallback: show confirmation message if login fails
                        setShowConfirmationMessage(true)
                    }
                }
            }

            if (result.error) {
                console.error("Auth error:", result.error)
            }
        } catch (error) {
            console.error("Unexpected error:", error)
        } finally {
            setLoading(false)
        }
    }


    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }} >
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
                type={showPassword ? 'text' : 'password'} // 👈 toggle type
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
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
                {isLogin ? 'Login' : 'Register'}
            </Button>
        </Box>
    )
}

export default AuthForm
