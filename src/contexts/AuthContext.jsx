import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // 1️⃣ Get current session from storage
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error getting session:", error);
                    setAuthError(error.message);
                }

                if (session?.user) {
                    // 2️⃣ Refresh session in case token expired after reload
                    const { data: refreshed, error: refreshError } =
                        await supabase.auth.refreshSession();

                    if (refreshError) {
                        console.error("Error refreshing session:", refreshError);
                        setUser(session.user); // fallback to stored session
                    } else {
                        setUser(refreshed?.user ?? session.user);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Unexpected error getting session:", err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // 3️⃣ Listen for sign in/out/refresh events
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Auth event:", _event, session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Auto-upsert profile on sign in / update
            if ((_event === "SIGNED_IN" || _event === "USER_UPDATED") && session?.user) {
                supabase
                    .from("profiles")
                    .upsert(
                        {
                            id: session.user.id,
                            display_name: session.user.email.split("@")[0],
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: "id" }
                    )
                    .then(({ error }) => {
                        if (error) {
                            console.error("Error creating/updating profile:", error);
                            setAuthError(error.message);
                        }
                    });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (data) => {
        try {
            setAuthError(null);
            const { data: signUpData, error } = await supabase.auth.signUp(data);
            if (error) {
                setAuthError(error.message);
                return { error };
            }
            return { success: true, data: signUpData };
        } catch (error) {
            setAuthError(error.message);
            return { error };
        }
    };

    const signIn = async (data) => {
        try {
            setAuthError(null);
            const result = await supabase.auth.signInWithPassword(data);
            if (result.error) {
                setAuthError(result.error.message);
            }
            return result;
        } catch (error) {
            setAuthError(error.message);
            return { error };
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        }
    };

    const value = {
        signUp,
        signIn,
        signOut,
        user,
        loading,
        error: authError,
        clearError: () => setAuthError(null),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
