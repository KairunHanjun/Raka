import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { RequestHandler, RouteParams } from './$types';

function getMasalah(event: RequestEvent<RouteParams, "/fetchHere">, formData: FormData): string {

    return '';
}

function getAbsensi(event: RequestEvent<RouteParams, "/fetchHere">, formData: FormData): string {

    return '';
}

function getCustomer(event: RequestEvent<RouteParams, "/fetchHere">, formData: FormData): string {

    return '';
}

export const GET: RequestHandler = async (event) => {

    redirect(302, '/');
};

export const POST: RequestHandler = async (event) => {
    const formData: FormData = await event.request.formData();
    const typeOfPost: string = (formData.get('typeOfPost')?.toString() ?? '').toString();
    let return_json: string = '';
    let return_code: number = 0;
    switch(typeOfPost) {
        case "get_masalah":return_json = getMasalah(event, formData);
        case "get_absensi":return_json = getAbsensi(event, formData);
        case "get_customer":return_json = getCustomer(event, formData);
    }
    if(return_json === "failed"){
        
    }

    return new Response(JSON.stringify(return_json), {status: 200, headers:{'Content-Type': 'application/json'}});
}