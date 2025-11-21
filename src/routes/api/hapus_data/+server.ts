import { db } from '$lib/server/db';
import { absensi, accounts, customers, masalah } from '$lib/server/db/schema';
import { and, eq, gte, inArray, isNull, lt } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({request, locals}) => {
    const host = locals.user?.username;
    const accountsType = locals.user?.accountType;
    if(accountsType !== 'H' || !host) throw new Error("Tidak ada host login.");
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
        case 'sebulan':{
            const [jenis, date] = id.split('|');
            const [year, bulan] = date.split('-');
            const from = new Date(Number(year), Number(bulan) - 1, 1);
            const to = new Date(Number(year), Number(bulan), 1); // next month
            switch(jenis){
                case 'Unit':{
                    await db
                    .delete(customers)
                    .where(
                        and(
                            eq(customers.hostName, host),
                            gte(customers.fromTime, from.toString()),
                            lt(customers.fromTime, to.toString())
                        )
                    );
                    break;
                }
                case 'Masalah':{
                    const accountsByHost = await db
                        .select({ username: accounts.username })
                        .from(accounts)
                        .where(and(eq(accounts.createdByWho, host), eq(accounts.accountType, 'T')));

                    // Extract array of usernames
                    const allowedNames = accountsByHost.map(a => a.username);

                    if (allowedNames.length === 0) break;
                    await db.delete(masalah).where(
                        and(
                            inArray(masalah.name, allowedNames),
                            gte(masalah.when, from),
                            lt(masalah.when, to)
                        )
                    );
                    break;
                }
                case 'Absensi':{
                    const accountsByHost = await db
                        .select({ username: accounts.username })
                        .from(accounts)
                        .where(eq(accounts.createdByWho, host));

                    // Extract array of usernames
                    const allowedNames = accountsByHost.map(a => a.username);

                    if (allowedNames.length === 0) break; // nothing to delete
                    await db
                    .delete(absensi)
                    .where(
                        and(
                            inArray(absensi.name, allowedNames),
                            gte(absensi.whenEntry, from),
                            lt(absensi.whenEntry, to)
                        )
                    );
                    break;
                }
                default:
                    throw Error('Tipe menghapus tidak ditemukan');
            }
            break;
        }
        default:
            throw Error('Tipe menghapus tidak ditemukan');
    }

    return new Response();
};