// routes/signup/+page.server.ts

import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { hash } from "argon2";
import { generateIdFromEntropySize } from "lucia";
import { db } from "$lib/server/db";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { accounts, agents, units } from "$lib/server/db/schema";
import { eq, ne } from "drizzle-orm/sql/expressions/conditions";

function validateSession(){

}

export const load: PageServerLoad = async ({ }) => {
	//TODO: Validate Session User
	//TODO: get accounts&agent id from user session and put it in the createdByWho
	try {
	const dataAkun = await db.select({
		id: accounts.id,
		username: accounts.username,
		accountType: accounts.accountType
	}).from(accounts).where(ne(accounts.accountType, 'H')/*, eq(accounts.createdByWho, )*/);
	//Get Unit
	const dataUnits = await db.select().from(units);
	//Get Agent
	const dataAgents = await db.select().from(agents)/*.where(/*, eq(accounts.createdByWho, ))*/;
	//TODO: Get Masalah

	//TODO: Get Absensi

		return {
			dataAkun,
			dataUnits,
			dataAgents
		}
	} catch (error) {
		console.log((error as Error).cause || '');
		return {
			error: (error as Error).name,
			description: (error as Error).message
		}
	}
}

//TODO: Validate Session User First for every request from server
export const actions: Actions = {
	addAgent: async (event) => {
		const fromData: FormData = await event.request.formData();
		const AgentName: string = (fromData.get("AgentName"))?.toString() ?? '';
		const EmailAgent: string = (fromData.get("EmailAgent"))?.toString() ?? '';
		const PhoneAgent: string = (fromData.get("PhoneAgent"))?.toString() ?? '';
		let dataAgents;
		try {
			await db.insert(agents).values({
				nameAgent: AgentName as string,
				email: EmailAgent as string,
				phoneNumber: PhoneAgent as string,
				//TODO: Add created by who if login is added
				createdByWho: ''
			});
			dataAgents = await db.select().from(agents);
		} catch (error) {
			return fail(422, {
				description: "Unit telah terdaftar pada database",
				error: (error instanceof Error) ? (error as Error).message : "Unit already taken"
			})
		}
		return {
			dataAgents: (dataAgents) ? dataAgents : null,
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	},
	addUnit: async (event) => {
		const fromData: FormData = await event.request.formData();
		const UnitName: string = (fromData.get("UnitName"))?.toString() ?? '';
		const Status: string = (fromData.get("Status"))?.toString() ?? '';
		const FromTime: string = (fromData.get("from-time"))?.toString() ?? '';
		const ToTime: string = (fromData.get("to-time"))?.toString() ?? '';
		let dataUnit;
		try {
			await db.insert(units).values({
				nameUnit: UnitName as string,
				unitState: Status as any,
				fromTime: FromTime as string,
				toTime: ToTime as string
			});
			dataUnit = await db.select().from(units);
		} catch (error) {
			return fail(422, {
				description: "Unit telah terdaftar pada database",
				error: (error instanceof Error) ? (error as Error).message : "Unit already taken"
			})
		}
		return {
			dataUnits: (dataUnit) ? dataUnit : null,
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	},
	addAccount: async (event) => {
		const formData: FormData = await event.request.formData();
		const username: string = (formData.get("Username"))?.toString() ?? '';
		const password: string = (formData.get("Password"))?.toString() ?? '';
        const role = formData.get("Role");
        const email: string = (formData.get("Email"))?.toString() ?? '';
        const telp: string = (formData.get("Telp"))?.toString() ?? '';
        const createdAt: Date = new Date(Date.now());

		// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
		// keep in mind some database (e.g. mysql) are case insensitive
		if ( 
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, {
				error: "Invalid Username",
				description: "username harus lebih dari 3 dan kurang dari 31"
			});
		}
		if (password.length < 6 || password.length > 255) {
			return fail(400, {
				error: "Invalid password",
				description: "Password harus lebih dari 6 dan kurang dari 255"
			});
		}

		const userId = generateIdFromEntropySize(10); // 16 characters long
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			parallelism: 1
		});


		try {
			//console.log("Trying to insert data...");
			await db.insert(accounts).values({
				id: userId as string,
				username: username as string,
				email: email as string,
				accountType: role as any,
				passwordHash: passwordHash as string,
				phoneNumber: telp as string ,
				createdAt: new Date(createdAt),
				//TODO: Add created by who if login is added
				createdByWho: ''
			});
		} catch (error) {
			//console.log("Error: " + (error as Error).message);
			return fail(422, {
				description: "Nama telah terdaftar pada database",
				error: (error instanceof Error) ? (error as Error).message : "Username already taken"
			})
		}
		
		// const session = await createSession(generateSessionToken(), userId);
		// const sessionCookie = setSessionTokenCookie(event, session.id, new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
		const dataAkun = await db.select({
			id: accounts.id,
			username: accounts.username,
			accountType: accounts.accountType
		}).from(accounts).where(ne(accounts.accountType, 'H'));
		//console.log("Done: " + dataAkun);
		return {
			dataAkun,
			horay: true
		}
	},
	editUnit: async (event) => {
		const fromData: FormData = await event.request.formData();
		const UnitName: string = (fromData.get("UnitName"))?.toString() ?? '';
		const Status: string = (fromData.get("Status"))?.toString() ?? '';
		const FromTime: string = (fromData.get("from-time"))?.toString() ?? '';
		const ToTime: string = (fromData.get("to-time"))?.toString() ?? '';
		let dataUnit;
		try {
			await db.update(units).set({
				nameUnit: UnitName as string,
				unitState: Status as any,
				fromTime: FromTime as string,
				toTime: ToTime as string
			}).where(eq(units.nameUnit, (UnitName as string)));
			dataUnit = await db.select().from(units);
		} catch (error) {
			return fail(422, {
				description: "Unit telah terdaftar pada database",
				error: (error instanceof Error) ? (error as Error).message : "Unit already taken"
			})
		}
		return {
			dataUnits: (dataUnit) ? dataUnit : null,
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	},
	editAgent: async (event) => {
		const fromData: FormData = await event.request.formData();
		const AgentName: string = (fromData.get("AgentName"))?.toString() ?? '';
		const EmailAgent: string = (fromData.get("EmailAgent"))?.toString() ?? '';
		const PhoneAgent: string = (fromData.get("PhoneAgent"))?.toString() ?? '';
		const IdAgent: string = (fromData.get("IdAgent"))?.toString() ?? '';
		let dataAgents;
		try {
			await db.update(agents).set({
				nameAgent: AgentName as string,
				email: EmailAgent as string,
				phoneNumber: PhoneAgent as string,
				//TODO: Add created by who if login is added
				createdByWho: ''
			}).where(eq(agents.id, (IdAgent as string)));
			dataAgents = await db.select().from(agents);
		} catch (error) {
			return fail(422, {
				description: "Unit telah terdaftar pada database",
				error: (error instanceof Error) ? (error as Error).message : "Unit already taken"
			})
		}
		return {
			dataAgents: (dataAgents) ? dataAgents : null,
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	},
	editAccount: async (event) => {
		const formData: FormData = await event.request.formData();
		const username: string = (formData.get("Username"))?.toString() ?? '';
		const password: string = (formData.get("Password"))?.toString() ?? '';
        const role = formData.get("Role");
        const email: string = (formData.get("Email"))?.toString() ?? '';
        const telp: string = (formData.get("Telp"))?.toString() ?? '';
		const editAkunId: string = (formData.get("editAkunId")?.toString() ?? '');
        const createdAt: Date = new Date(Date.now());

		// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
		// keep in mind some database (e.g. mysql) are case insensitive
		if ( 
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, {
				error: "Invalid Username",
				description: "username harus lebih dari 3 dan kurang dari 31"
			});
		}
		if (password.length < 6 || password.length > 255) {
			return fail(400, {
				error: "Invalid password",
				description: "Password harus lebih dari 6 dan kurang dari 255"
			});
		}

		const userId = generateIdFromEntropySize(10); // 16 characters long
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			parallelism: 1
		});


		try {
			await db.update(accounts).set({
				id: userId as string,
				username: username as string,
				email: email as string,
				accountType: role as any,
				passwordHash: passwordHash as string,
				phoneNumber: telp as string ,
				createdAt: new Date(createdAt)
			}).where(eq(accounts.id, (editAkunId as string)));
		} catch (error) {
			return fail(422, {
				description: "Tidak bisa diubah datanya....",
				error: (error instanceof Error) ? (error as Error).message : "Data cannot be changed"
			})
		}
		
		// const session = await createSession(generateSessionToken(), userId);
		// const sessionCookie = setSessionTokenCookie(event, session.id, new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
		const dataAkun = await db.select({
			id: accounts.id,
			username: accounts.username,
			accountType: accounts.accountType
		}).from(accounts).where(ne(accounts.accountType, 'H'));
		return {
			dataAkun,
			horay: true
		}
	},
	deleteAgent: async (event) => {
		const formData: FormData = await event.request.formData();
		const IdAgent: string = (formData.get("AgentName"))?.toString() ?? '';
		let dataAgents;
		try {
			await db.delete(agents).where(eq(agents.nameAgent, (IdAgent as string)));
			dataAgents = await db.select().from(agents);
		} catch (error) {
			console.log("Delete Data Error...");
			return fail(422, {
				dataUnits: undefined!,
				success: false,
				message: "Tidak bisa diubah datanya....",
				error: (error instanceof Error) ? (error as Error).message : "Data cannot be changed"
			})
		}
		return {
			dataAgents: (dataAgents) ? dataAgents : null,
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	},
	deleteUnit: async (event) => {
		const formData: FormData = await event.request.formData();
		const unitName: string = (formData.get("unitName"))?.toString() ?? '';
		let dataUnit;
		try {
			await db.delete(units).where(eq(units.nameUnit, (unitName as string)));
			dataUnit = await db.select().from(units);
		} catch (error) {
			console.log("Delete Data Error...");
			return fail(422, {
				dataUnits: undefined!,
				success: false,
				message: "Tidak bisa diubah datanya....",
				error: (error instanceof Error) ? (error as Error).message : "Data cannot be changed"
			})
		}
		return {
			dataUnits: (dataUnit) ? dataUnit : null,
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	},
	deleteAccount: async (event) => {
		const formData: FormData = await event.request.formData();
		const id: string = (formData.get("id"))?.toString() ?? '';
		let dataAkun;
		try {
			await db.delete(accounts).where(eq(accounts.id, (id as string)));
			dataAkun = await db.select({
				id: accounts.id,
				username: accounts.username,
				accountType: accounts.accountType
			}).from(accounts).where(ne(accounts.accountType, 'H'));
		} catch (error) {
			console.log("Delete Data Error...");
			return fail(422, {
				success: false,
				message: "Tidak bisa diubah datanya....",
				error: (error instanceof Error) ? (error as Error).message : "Data cannot be changed"
			})
		}
		return {
			dataAkun: (dataAkun) ? dataAkun : null,
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	}
};
