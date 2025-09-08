import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext.jsx";

export const useRSVP = () => {
    const { user } = useAuth();
    const [rsvpLoading, setRsvpLoading] = useState(false);

    // ✅ Update RSVP and return event info
    const updateRSVP = async (eventId, status) => {
        if (!user) return { error: new Error("No logged in user") };

        setRsvpLoading(true);
        try {
            const { data, error } = await supabase
                .from("rsvps")
                .upsert({
                    event_id: eventId,
                    user_id: user.id,
                    status,
                    updated_at: new Date().toISOString(),
                })
                .select(
                    `
          status,
          events(id, title, description, event_date)
        `
                )
                .single(); // ✅ fetch back related event

            if (error) throw error;

            return {
                error: null,
                event: {
                    ...data.events,
                    status: data.status,
                },
            };
        } catch (error) {
            return { error };
        } finally {
            setRsvpLoading(false);
        }
    };

    // ✅ Fetch all events where RSVP = yes
    // fetch RSVP yes events
    const fetchRSVPEvents = async () => {
        if (!user) return [];
        try {
            const { data, error } = await supabase
                .from("rsvps")
                .select(`
        status,
        events(id, title, description, event_date)
      `)
                .eq("user_id", user.id)
                .eq("status", "yes"); // ✅ only yes

            if (error) throw error;

            return data.map((row) => ({
                ...row.events,
                status: row.status,
            }));
        } catch (error) {
            console.error("❌ Error Fetching RSVP events:", error.message);
            return [];
        }
    };


    return { updateRSVP, rsvpLoading, fetchRSVPEvents };
};
