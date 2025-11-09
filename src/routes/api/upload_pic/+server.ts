import { CREATE, DELETE } from "$lib/server/upload_cloudinary.js";

export const POST = async ({ request }) => {
    try {
        const formData = await request.formData();
        const once = +(formData.get("once")?.toString() ?? "0");
        if(once == 1){
            const img1 = formData.get("img1");
            if (!(img1 instanceof File)) 
                return new Response("Tidak ada gambar yang masuk", { status: 400 });
            
            const RgambarRuangan = await CREATE((img1 as File));
            if(!RgambarRuangan){
                return new Response("Gambar gagal diupload", {status: 422})
            }
            return new Response(`${RgambarRuangan.public_id}}`, {status: 200});
        }else{
            const img1 = formData.get("img1");
            const img2 = formData.get("img2");
            if (!(img1 instanceof File) && !(img2 instanceof File)) 
                return new Response("Tidak ada gambar yang masuk", { status: 400 });
            
            const RgambarRuangan = await CREATE((img1 as File));
            if(!RgambarRuangan){
                return new Response("Gambar gagal diupload", {status: 422})
            }
            const RgambarKamarMandi = await CREATE((img2 as File));
            if(!RgambarKamarMandi){
                const delete_response = await DELETE(RgambarRuangan.public_id);
                if(!delete_response) return new Response("Gambar gagal dihapus", {status: 422})
                return new Response("Gambar gagal diupload", {status: 422})
            }
            return new Response(`${RgambarRuangan.public_id}|${RgambarKamarMandi.public_id}`, {status: 200});
        }
    } catch (error) {
        return new Response("Upload Gagal!", { status: 500 });
    }
}