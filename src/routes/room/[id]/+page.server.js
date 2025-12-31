/** @type {import('./$types').PageServerLoad} */

import { supabase } from '$lib/supabase';
import { fail } from '@sveltejs/kit';

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
        player = cookies.get('race-name')
        console.log("player name from cookies is: ", player)
        if (player) {
            return {
                name: data[0].name,
                id: data[0].id,
                player: player
            }
        } else {
            return fail(404, { noPlayer: true });
        }
    } else {
        return fail(404, { noRoom: true });
    }

}
