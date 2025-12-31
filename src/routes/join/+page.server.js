/** @type {import('./$types').PageServerLoad} */

import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { goto } from '$app/navigation';
import { error } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({request, cookies}) => {
        let formdata = await request.formData()

        let name = formdata.get('player')
        let room = formdata.get('room')
        let pass = formdata.get('password')

        const {data, error} = await supabase
            .from('rooms')
            .select()
            .eq('name', room.toLowerCase())

        console.log(data)

        if (data.length > 0) {
            if (data[0].password === pass) {
                console.log("Correct password")
                cookies.set('race-name', name, { 
                    path: '/',
                    expires: new Date(Date.now() + 60 * 60 * 1000),
                })
                console.log(data[0].id)
                redirect(303, "/room/"+data[0].id)
            } else {
                console.log("Incorrect password")
                return fail(400, { pass, incorrect: true })
            }
        } else {
            console.log("Room does not exist")
            error(404, 'Room Not Found');
        }
    }
}