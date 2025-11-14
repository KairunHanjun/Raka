
// place files you want to import through the `$lib` alias in this folder.
export function toExcelLocalTime(dateStr: string) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    // Subtract timezone offset so Excel shows correct local time
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
}

export async function compressImage(file: File, maxSizeMB = 4): Promise<File> {
    const img = await createImageBitmap(file);
    const canvas = document.createElement("canvas");

    // Resize proportionally
    const maxWidth = 1920;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Quality roughly estimated for ~4MB, you can tweak it
    let quality = 0.9;
    let blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
    );

    // Further compress until under limit
    while (blob && blob.size > maxSizeMB * 1024 * 1024 && quality > 0.2) {
        quality -= 0.1;
        blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
        );
    }

    return new File([blob!], file.name.replace(/\.[^.]+$/, ".jpg"), {
        type: "image/jpeg",
    });
}

export async function deletePic(imgId1: string, imgId2: string = ''): Promise<string>{
        const formData = new FormData();
        if(imgId2.trim().length <= 0){
            formData.set('img1', imgId1);
            formData.set('once', '1');
        }else{
            formData.set('img1', imgId1);
            formData.set('img2', imgId2);
        }
        try {
            const res = await fetch("/api/delete_pic", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error(await res.text());
            return '';
        }catch(error){
            return (error as Error).message;
        }
    }