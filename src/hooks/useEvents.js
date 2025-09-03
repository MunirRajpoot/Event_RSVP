import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();

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
    }, []);

    // Fetch events for logged-in user (both created + invited)
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
                .select(`
                    *,
                    event_invites(user_id),
                    rsvps(*)
                `)
                .or(`host_id.eq."${user.id}", event_invites.user_id.eq."${user.id}"`);

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
        debugger
        try {
            console.log("⚡ createEvent CALLED with:", eventData);

            const { data, error: userError } = await supabase.auth.getUser()
            console.log("👤 getUser result:", data, userError);
            debugger
            // if (userError) throw userError;
            // if (!user) throw new Error("No logged-in user");
debugger
            // const { data, error } = await supabase
            //     .from("events")
            //     .insert([{ ...eventData, host_id: user.id }])
            //     .select()
            //     .single();

            // console.log("📥 Supabase response:", { data, error });

            // if (error) throw error;

            // setEvents((prev) => [...prev, data]);
            // return { event: data, error: null };
        } catch (error) {
            debugger
            console.error("❌ Error creating event:", error);
            return { event: null, error };
        }
    };





    return { events, loading, createEvent, fetchEvents };
};
