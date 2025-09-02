import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authError, setAuthError] = useState(null)

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Error getting session:', error)
                    setAuthError(error.message)
                }
                setUser(session?.user ?? null)
            } catch (err) {
                console.error('Unexpected error getting session:', err)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event, session)

                setUser(session?.user ?? null)
                setLoading(false)

                // Create profile if user signs up or signs in
                if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
                    try {
                        const { error } = await supabase
                            .from('profiles')
                            .upsert({
                                id: session.user.id,
                                display_name: session.user.email.split('@')[0],
                                updated_at: new Date().toISOString(),
                            }, {
                                onConflict: 'id'
                            })

                        if (error) {
                            console.error('Error creating/updating profile:', error)
                            setAuthError(error.message)
                        }
                    } catch (err) {
                        console.error('Unexpected error creating profile:', err)
                    }
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (data) => {
        try {
            setAuthError(null)
            const { error } = await supabase.auth.signUp(data)
            if (error) {
                setAuthError(error.message)
                return { error }
            }
            return { success: true }  // <-- return flag for success
        } catch (error) {
            setAuthError(error.message)
            return { error }
        }
    }

    const signIn = async (data) => {
        try {
            setAuthError(null)
            const result = await supabase.auth.signInWithPassword(data)
            if (result.error) {
                setAuthError(result.error.message)
            }
            return result
        } catch (error) {
            setAuthError(error.message)
            return { error }
        }
    }

    const value = {
        signUp,
        signIn,
        signOut: () => supabase.auth.signOut(),
        user,
        loading,
        error: authError,
        clearError: () => setAuthError(null)
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export default AuthProvider