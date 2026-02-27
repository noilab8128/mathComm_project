/**
 * Resizes a base64 image to be under a certain size and/or dimensions
 */
export async function resizeImage(base64Str: string, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (e) => reject(e);
    });
}
