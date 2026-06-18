export interface PdfConversionResult {
  imageFile: File | null;
  error?: string;
}

let workerConfigured = false;

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    if (!workerConfigured) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
      workerConfigured = true;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      return { imageFile: null, error: 'Could not get 2D canvas context' };
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    return await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, '');
            const imageFile = new File([blob], `${originalName}.png`, {
              type: 'image/png',
            });
            resolve({ imageFile });
          } else {
            resolve({ imageFile: null, error: 'Failed to create image blob' });
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (err) {
    return {
      imageFile: null,
      error: `Failed to convert PDF: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
