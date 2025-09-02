import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useRSVP = () => {
    const [rsvpLoading, setRsvpLoading] = useState(false)

    const updateRSVP = async (eventId, status) => {
        setRsvpLoading(true)
        try {
            const { error } = await supabase
                .from('rsvps')
                .upsert({
                    event_id: eventId,
                    user_id: supabase.auth.user()?.id,
                    status,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        } finally {
            setRsvpLoading(false)
        }
    }

    return { updateRSVP, rsvpLoading }
}