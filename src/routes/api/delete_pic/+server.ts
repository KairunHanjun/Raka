import {DELETE } from "$lib/server/upload_cloudinary.js";

export const POST = async ({ request }) => {
    try {
        const formData = await request.formData();
        const once = +(formData.get("once")?.toString() ?? "0");
        if(once == 1){
            const img1 = formData.get("img1")?.toString() ?? '' ;
            if (img1 == '') 
                return new Response("Tidak ada id gambar yang masuk", { status: 400 });
            
            const RgambarRuangan = await DELETE(img1);
            if(!RgambarRuangan){
                return new Response("Gambar gagal dihapus", {status: 422})
            }
            return new Response(`${RgambarRuangan.public_id}}`, {status: 200});
        }else{
            const img1 = formData.get("img1")?.toString() ?? '' ;
            const img2 = formData.get("img2")?.toString() ?? '' ;
            if (img1 == '') 
                return new Response("Tidak ada id gambar yang masuk", { status: 400 });
            
            const RgambarRuangan = await DELETE(img1);
            if(!RgambarRuangan){
                return new Response("Gambar gagal dihapus", {status: 422})
            }
            const RgambarKamarMandi = await DELETE(img2);
            if(!RgambarKamarMandi){
                return new Response("Gambar gagal dihapus", {status: 422})
            }
            return new Response(`Gambar berhasil dihapus`, {status: 200});
        }
    } catch (error) {
        return new Response("Upload Gagal!", { status: 500 });
    }
}