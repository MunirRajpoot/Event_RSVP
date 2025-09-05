import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext.jsx"

export const useRSVP = () => {
    const { user } = useAuth();
    const [rsvpLoading, setRsvpLoading] = useState(false);

    const updateRSVP = async (eventId, status) => {
        if (!user) return { error: new Error("No logged in user") };

        setRsvpLoading(true);
        try {
            const { error } = await supabase
                .from("rsvps")
                .upsert({
                    event_id: eventId,
                    user_id: user.id, // ✅ use context user
                    status,
                    updated_at: new Date().toISOString(),
                });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        } finally {
            setRsvpLoading(false);
        }
    };

    return { updateRSVP, rsvpLoading };
};
