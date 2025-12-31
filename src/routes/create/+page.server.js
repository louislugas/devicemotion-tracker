/** @type {import('./$types').PageServerLoad} */

import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { goto } from '$app/navigation';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		let formdata = await event.request.formData()

        let room = formdata.get('room')
        let pass = formdata.get('password')

        console.log(room)
        console.log(pass)
        
        const {data, error} = await supabase
            .from('rooms')
            .select()
            .eq('name', room.toLowerCase())
        
        console.log(data, error, "check room data");

        if (data.length > 0) {
            console.log("Room name already exists")
            return fail(400, { room, duplicate: true });
        } else {
            console.log("Room name is available");

            let id = Math.floor(Math.random()*9999)

            const { data, error } = await supabase
                .from('rooms')
                .insert([{ 
                    name: room.toLowerCase(),
                    id: id,
                    password: pass
                }])
                .select()
                .single();

            if (error) {
                console.error("Error creating room:", error);
            } else {
                console.log("Room created:", data);
                redirect(303, "/")
            }
        }
	}
};