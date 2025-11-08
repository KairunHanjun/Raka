import { db } from '$lib/server/db';
import { absensi, accounts, customers, masalah } from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({request}) => {
    const formData: FormData = await request.formData();
    let typeOfDelete: string = formData.get('typeOfDelete')?.toString() ?? '';
    let id: string | null = formData.get('id')?.toString() ?? null;
    if(id === null) throw new Error("Id Kosong");
    switch (typeOfDelete) {
        case 'customers':{
            const check_customers = await db.select().from(customers).where(and(eq(customers.idCostumers, id), isNull(customers.unitId)));
            if(check_customers.length == 0) throw new Error("Kostumer masih di dalam unit");
            await db.delete(customers).where(and(eq(customers.idCostumers, id), isNull(customers.unitId)));
            break;
        }
        case 'absensi':{
            await db.delete(absensi).where(eq(absensi.id, id));
            break;
        }
        case 'masalah':{
            const check_masalah = await db.select().from(masalah).where(and(eq(masalah.id, id), eq(masalah.done, true)));
            if(check_masalah.length == 0) throw new Error("Antara tidak punya masalah atau masalah belum terselesaikan");
            await db.delete(masalah).where(and(eq(masalah.id, id), eq(masalah.done, true)));
            break;
        }
        default:
            throw Error('Tipe menghapus tidak ditemukan');
    }

    return new Response();
};