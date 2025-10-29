import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { agents, masalah, units } from "$lib/server/db/schema";
import { asc } from "drizzle-orm";



export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.accountType !== 'FO') {
		throw redirect(302, '/');
	}

    try{
        const dataUnits = await db.select().from(units).orderBy(asc(units.unitState));
        const dataAgents = await db.select().from(agents);
        return {
            dataUnits,
            dataAgents,
            userNow: locals.user
        }
    }catch(error){
        error = (error as Error);
        return { 
            error: error,
            description: "Terjadi kesalahan saat mengambil data",
            userNow: locals.user
        }
    }
}

export const actions: Actions = {
    default: async (event) => {
        try {
            
        } catch (error) {
            error = (error as Error);
            return{
                error,
                description: "Terjadi kesalahan",
            }
        }
    },
    customer: async (event) => {

    },
    absen: async (event) => {

    },
    masalah: async (event) => {
        
    }
}