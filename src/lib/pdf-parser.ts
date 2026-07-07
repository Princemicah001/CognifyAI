/**
 * Client-side helper to extract text from PDF and TXT files using CDN-loaded PDF.js.
 * This avoids server-side memory limits, Next.js server action file limits,
 * and Groq vision model limitations with PDF files.
 */

export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('PDF parsing is only supported in browser environment.'));
      return;
    }

    const runParser = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error('PDF.js library failed to load.'));
          return;
        }

        // Configure worker using official CDN link matching the library version
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Join the text items of the page
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n\n';
        }
        
        resolve(fullText.trim());
      } catch (error: any) {
        console.error('Error parsing PDF client-side:', error);
        reject(new Error(`Failed to parse PDF file: ${error.message || error}`));
      }
    };

    if ((window as any).pdfjsLib) {
      runParser();
    } else {
      // Load script from CDN dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        runParser();
      };
      script.onerror = () => {
        reject(new Error('Failed to load PDF.js from CDN.'));
      };
      document.head.appendChild(script);
    }
  });
}

export async function extractTextFromTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve((e.target?.result as string) || '');
    };
    reader.onerror = () => {
      reject(new Error('Failed to read text file.'));
    };
    reader.readAsText(file);
  });
}
