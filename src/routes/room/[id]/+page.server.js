/** @type {import('./$types').PageServerLoad} */

import { supabase } from '$lib/supabase';
import { fail, redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load = async ({ params, cookies }) => {

    let player = ""

    console.log(params.id)

    const {data} = await supabase
        .from('rooms')
        .select()
        .eq('id', params.id)

    console.log(data)
    
    if (data.length > 0) {
        console.log(data)
        if (!cookies.get('race-name')) {
            error(400, "Player's Session Over");
        } else {
            player = cookies.get('race-name')
            console.log("player name from cookies is: ", player)
            return {
                name: data[0].name,
                id: data[0].id,
                player: player
            }
        }
    } else {
        error(404, 'Room Not Found');
    }

}
