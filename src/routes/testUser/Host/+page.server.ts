// routes/signup/+page.server.ts

import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { hash } from "argon2";
import { generateIdFromEntropySize } from "lucia";
import { db } from "$lib/server/db";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { accounts } from "$lib/server/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export const load: PageServerLoad = async ({ }) => {
	//TODO: Validate Session User
	try {
	
	//TODO: Get Account
	const dataAkun = await db.select({
		id: accounts.id,
		username: accounts.username,
		accountType: accounts.accountType
	}).from(accounts);
	console.log(dataAkun);
	//TODO: Get Unit

	//TODO: Get Agent

	//TODO: Get Masalah

	//TODO: Get Absensi

	//TODO: Get Room

		return {
			dataAkun
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

	},
	addUnit: async (event) => {

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


		// TODO: check if username is already used
		try {
			await db.insert(accounts).values({
				id: userId as string,
				username: username as string,
				email: email as string,
				accountType: role as any,
				passwordHash: passwordHash as string,
				phoneNumber: telp as string ,
				createdAt: new Date(createdAt)
			});
		} catch (error) {
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
		}).from(accounts);
		return {
			dataAkun,
			horay: true
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


		// TODO: check if username is already used
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
		}).from(accounts);
		return {
			dataAkun,
			horay: true
		}
	},
	deleteAccount: async (event) => {
		console.log("Delete Data Start...");
		const formData: FormData = await event.request.formData();
		const id: string = (formData.get("id"))?.toString() ?? '';

		try {
			await db.delete(accounts).where(eq(accounts.id, (id as string)));
				
		} catch (error) {
			console.log("Delete Data Error...");
			return fail(422, {
				success: false,
				message: "Tidak bisa diubah datanya....",
				error: (error instanceof Error) ? (error as Error).message : "Data cannot be changed"
			})
		}
		console.log("Delete Data End...");
		return {
			success: true,
			message: "Data berhasil dihapus",
			error: null
		}
	}
};
