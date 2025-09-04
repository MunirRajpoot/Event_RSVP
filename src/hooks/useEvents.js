import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext.jsx";

export const useEvents = () => {
    const { user } = useAuth();
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
                () => {
                    if (user) fetchEvents(); // ✅ safeguard
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Fetch events
    const fetchEvents = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
        *,
        event_invites!inner(user_id),
        rsvps(*)
      `)
                .or(`host_id.eq.${user.id}`) // only for base table
                .eq('event_invites.user_id', user.id); // filter relation separately

            if (error) throw error;

            setEvents(data || []);
        } catch (error) {
            console.error('❌ Error fetching events:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Create new event
    const createEvent = async (eventData) => {
        if (!user) return { event: null, error: new Error("No logged-in user") };
        console.log("📤 Creating event for user:", user.id);
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
