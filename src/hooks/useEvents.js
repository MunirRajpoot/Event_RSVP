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
        // setLoading(true);
        try {
            const { data, error } = await supabase
                .from("events")
                .select(`*, rsvps(*), event_invites(*)`)
                .eq("host_id", user.id);

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error("❌ Error fetching hosted events:", error.message);
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

    //update and existing event
    const updateEvent = async (id, eventData) => {
        if (!user) return { event: null, error: new Error("No Logged-in user") };
        try {
            const { data, error } = await supabase
                .from("events")
                .update({ ...eventData })
                .eq("id", id)
                .select()
                .single()
            if (error) throw error;
            setEvents((prev) => prev.map(e => e.id === id ? data : e))
            return { event: data, error: null }
        } catch (error) {
            console.error("Error Updating Event:", error.message);
            return { event: null, error }
        }

    }


    // Delete an Event
    const deleteEvent = async (id) => {
        if (!user) return { success: false, error: new Error("No Logged-in User") }
        try {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setEvents((prev) => prev.filter(e => e.id !== id))
        } catch (error) {
            console.error("Error Deleting Event:", error.message);
            return { success: false, error }
        }
    }


    // Invite User to Event
    const inviteUserToEvent = async (eventId, userId) => {
        if (!user) return { success: false, error: new Error("No Logged In User") };
        try {
            const { data, error } = await supabase
                .from("event_invites")
                .insert([{ event_id: eventId, user_id: userId, role: "guest" }])
                .select()
                .single()
            if (error) throw error
            return { success: true, invite: data }
        } catch (error) {
            console.error("Error Inviting User:", error.message)
            return { success: false, error }
        }
    }


    const fetchInvites = async (eventId) => {
        try {
            const { data, error } = await supabase
                .from("event_invites")
                .select(`
        id,
        user_id,
        role,
        profiles(display_name)
      `)
                .eq("event_id", eventId);

            if (error) throw error;
            return { invites: data, error: null };
        } catch (error) {
            console.error("❌ Error fetching invites:", error.message);
            return { invites: [], error };
        }
    };

    const removeInvite = async (inviteId) => {
        try {
            const { error } = await supabase
                .from("event_invites")
                .delete()
                .eq("id", inviteId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("❌ Error removing invite:", error.message);
            return { success: false, error };
        }
    };


    //fetch invited events (only guest)
    const fetchInvitedEvents = async () => {
        if (!user) return [];
        try {
            // 1. Get all invites for this user as guest
            const { data: invites, error } = await supabase
                .from("event_invites")
                .select("event_id, role")
                .eq("user_id", user.id)
                .eq("role", "guest");

            if (error) throw error;
            if (!invites || invites.length === 0) return [];

            const eventIds = invites.map(invite => invite.event_id);

            // 2. Get event details for those IDs
            const { data: events, error: eventError } = await supabase
                .from("events")
                .select("id, title, description, event_date, host_id")
                .in("id", eventIds);

            if (eventError) throw eventError;

            // 3. Merge role info
            const invitedEvents = events.map(event => {
                const invite = invites.find(i => i.event_id === event.id);
                return { ...event, role: invite?.role || "guest" };
            });

            return invitedEvents;
        } catch (err) {
            console.error("❌ Error fetching invited events:", err.message);
            return [];
        }
    };



    //   // ✅ All events (hosted + invited)
    //   const fetchAllEvents = async () => {
    //     if (!user) return;
    //     setLoading(true);
    //     try {
    //       const { data, error } = await supabase
    //         .from("events")
    //         .select(`
    //           *,
    //           event_invites(user_id),
    //           rsvps(*)
    //         `)
    //         .or(`host_id.eq.${user.id},event_invites.user_id.eq.${user.id}`);

    //       if (error) throw error;
    //       setEvents(data || []);
    //     } catch (error) {
    //       console.error("❌ Error fetching all events:", error.message);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    return { events, loading, createEvent, updateEvent, deleteEvent, fetchEvents, inviteUserToEvent, fetchInvites, removeInvite, fetchInvitedEvents };
};
