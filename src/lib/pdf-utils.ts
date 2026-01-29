/**
 * Converts specific pages of a PDF file into an array of base64 image strings.
 */
export async function convertPdfToImages(
    pdfBuffer: ArrayBuffer,
    targetPages?: number[]
): Promise<{ images: string[], totalPages: number }> {
    // Dynamic import to avoid SSR issues with pdfjs-dist (DOMMatrix)
    const pdfjs = await import('pdfjs-dist');

    // Configure the worker
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        // Use UNPKG for a reliable source of the worker file. 
        // Note: For pdfjs-dist 4.0+, the worker file has a .mjs extension
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const images: string[] = [];

    try {
        const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        // Determine which pages to render
        const pagesToRender = targetPages && targetPages.length > 0
            ? targetPages.filter(p => p >= 1 && p <= numPages)
            : Array.from({ length: Math.min(numPages, 5) }, (_, i) => i + 1); // Default to first 5 if none specified

        for (const pageNum of pagesToRender) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.2 }); // Reduced scale to optimize token usage

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                console.error('Canvas context not available');
                continue;
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: context.canvas,
            }).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            images.push(dataUrl);
        }

        return { images, totalPages: numPages };
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        throw error;
    }
}
