import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

export const useComments = () => {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // ✅ Add Comment
    const addComment = async (eventId, content) => {
        if (!user) return { error: new Error("User not logged in") };

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("comments")
                .insert([
                    {
                        event_id: eventId,
                        user_id: user.id,
                        content,
                    },
                ])
                .select(
                    `
          id,
          content,
          created_at,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `
                )
                .single(); // ✅ only return one row instead of array

            if (error) throw error;
            return { data, error: null }; // ✅ always return single object
        } catch (error) {
            console.error("❌ Add comment error:", error.message);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch Comments
    // ✅ Fetch Comments
    const fetchComments = async (eventId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("comments")
                .select(`
              id,
              content,
              created_at,
              user_id,
              profiles (
                id,
                display_name,
                avatar_url
              )
            `)
                .eq("event_id", eventId)
                .order("created_at", { ascending: true }); // ✅ oldest → newest

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("❌ Fetch comments error:", error.message);
            return { error };
        } finally {
            setLoading(false);
        }
    };


    return { addComment, fetchComments, loading };
};
