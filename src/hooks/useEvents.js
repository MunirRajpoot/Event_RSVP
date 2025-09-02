import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();

        // Subscribe to realtime updates
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
    }, []);

    // Fetch events for logged-in user
    const fetchEvents = async () => {
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) {
                setEvents([]);
                return;
            }

            const { data, error } = await supabase
                .from("events")
                .select(
                    `
            *,
            event_invites!inner(*),
            rsvps(*)
          `
                )
                .eq("event_invites.user_id", user.id);

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
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) throw new Error("No logged-in user");

            const { data, error } = await supabase
                .from("events")
                .insert([
                    {
                        ...eventData,
                        host_id: user.id, // ✅ required foreign key
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            // ✅ Optimistically update local state
            setEvents((prev) => [...prev, data]);

            return { event: data, error: null };
        } catch (error) {
            console.error("❌ Error creating event:", error.message);
            return { event: null, error };
        }
    };

    return { events, loading, createEvent, fetchEvents };
};
