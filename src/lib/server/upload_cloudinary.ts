import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "$env/static/private";
import { v2 as cloudinary, type TransformationOptions, type UploadApiErrorResponse, type UploadApiResponse } from "cloudinary";


export async function CREATE(file: File) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY, // Store in .env.local
        api_secret: CLOUDINARY_API_SECRET, // Store in .env.local
        secure: true
    });
    try{
        const arrayBuffer = await file.arrayBuffer();
        const asBuffer = Buffer.from(arrayBuffer);
        const result_upload: UploadApiErrorResponse | UploadApiResponse | undefined= await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'image',
                format: 'jpg'
            }, (error, uploadResult) => {
                if (error) {
                    return reject(error);
                }
                return resolve(uploadResult);
            }).end(asBuffer);
        })
        if(!result_upload)
            return null;
        if("message" in result_upload)
            return null
        return result_upload as UploadApiResponse;
    }catch(error){
        console.log(error);
        return null
    }

}

export async function READ(public_id: string, transformation?: TransformationOptions): Promise<string> {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY, // Store in .env.local
        api_secret: CLOUDINARY_API_SECRET, // Store in .env.local
        secure: true
    });
    return cloudinary.url(public_id, {
        resource_type: 'image',
        format: 'png',
        transformation
    })
}

export async function DELETE(public_id: string) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY, // Store in .env.local
        api_secret: CLOUDINARY_API_SECRET, // Store in .env.local
        secure: true
    });
    try{
        const result_upload: UploadApiErrorResponse | UploadApiResponse | undefined= await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(public_id, (error, uploadResult) => {
                if (error) {
                    console.log(error);
                    return reject(error);
                }
                return resolve(uploadResult);
            });
        })
        if(!result_upload)
            return null;
        if("message" in result_upload)
            return null
        return result_upload as UploadApiResponse;
    }catch(error){
        console.log(error);
        return null
    }
}