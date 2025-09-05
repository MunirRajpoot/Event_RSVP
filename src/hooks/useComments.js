import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

export const useComments = () => {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const addComment = async (eventId, content) => {
        if (!user) return { error: "User Not logged In" };

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("comments")
                .insert({
                    event_id: eventId,
                    user_id: user.id,
                    content,
                })
                .select(`
                id,
                content,
                created_at,
                profiles(id, display_name, avatar_url)
                `)
                .single();
            if (error) throw error;
            return { data, error: null }

        } catch (error) {
            return { error }

        } finally {
            setLoading(false)
        }

    }

    // fetch Comments
    const fetchComments = async (eventId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("comments")
                .select(`
                id,
                content,
                created_at,
                profiles(id, display_name, avatar_url)
                `)
                .eq("event_id", eventId)
                .order("created_at", { ascending: false })

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { error }
        } finally {
            setLoading(false)
        }
    }

    return { addComment, fetchComments, loading }
}