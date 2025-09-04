import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext.jsx"; // <-- import your auth hook

export const useEvents = () => {
    const { user } = useAuth(); // ✅ use context user
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchEvents();
        } else {
            setEvents([]);
            setLoading(false);
        }

        // Realtime subscription
        const channel = supabase
            .channel("events_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "events" },
                () => fetchEvents()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]); // ✅ re-run when user changes

    // Fetch events for logged-in user (both created + invited)
    const fetchEvents = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("events")
                .select(`
          *,
          event_invites(user_id),
          rsvps(*)
        `)
                .or(`host_id.eq.${user.id}, event_invites.user_id.eq.${user.id}`);

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error("❌ Error fetching events:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Create new event
    const createEvent = async (eventData) => {
        if (!user) return { event: null, error: new Error("No logged-in user") };

        try {
            const { data, error } = await supabase
                .from("events")
                .insert([{ ...eventData, host_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            setEvents((prev) => [...prev, data]);
            return { event: data, error: null };
        } catch (error) {
            console.error("❌ Error creating event:", error.message);
            return { event: null, error };
        }
    };

    return { events, loading, createEvent, fetchEvents };
};
