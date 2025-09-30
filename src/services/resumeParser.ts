import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// This is required for pdfjs to work in a web environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Function to extract text from a file (PDF or DOCX)
const getTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const pdf = await pdfjsLib.getDocument(event.target?.result as ArrayBuffer).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
          }
          resolve(text);
        } catch (error) {
          reject('Error parsing PDF file.');
        }
      };
      reader.onerror = () => reject('Error reading file.');
      reader.readAsArrayBuffer(file);
    });
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: event.target?.result as ArrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject('Error parsing DOCX file.');
        }
      };
      reader.onerror = () => reject('Error reading file.');
      reader.readAsArrayBuffer(file);
    });
  } else {
    return Promise.reject('Unsupported file type.');
  }
};

// Regex patterns to find details
const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

// A simple approach to find a name (often at the start of the resume)
const nameRegex = /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/;

export interface CandidateDetails {
  name: string | null;
  email: string | null;
  phone: string | null;
}

// Main function to parse the resume and extract details
export const parseResume = async (file: File): Promise<CandidateDetails> => {
  try {
    const text = await getTextFromFile(file);
    
    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    const nameMatch = text.match(nameRegex);

    return {
      name: nameMatch ? nameMatch[0].trim() : null,
      email: emailMatch ? emailMatch[0].trim() : null,
      phone: phoneMatch ? phoneMatch[0].trim() : null,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
};