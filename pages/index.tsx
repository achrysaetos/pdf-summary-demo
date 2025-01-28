import { useState, useEffect, useCallback } from "react";
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

// API call to summarize and answer questions about the PDF
export async function callChat(input: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get response');
  }
  
  const data = await response.json();
  return data.content;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLength, setSummaryLength] = useState("medium");

  const handleClick = async (input: string) => {
    setResponse("");
    setIsLoading(true);
    const instructions = input ? 
      `Question: ${input} \n\n Context: ` : 
      `Summarize the following text with a ${summaryLength} length response, no more than ${getNumParagraphs(summaryLength)} paragraphs (list key points only): `;
    const response = await callChat(instructions + pdfText);
    setResponse(response);
    setIsLoading(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const getNumParagraphs = (summaryLength: string) => {
    return summaryLength === "short" ? "one" : summaryLength === "medium" ? "two" : "three";
  }

  // Convert the PDF to a usuable text format
  const extractTextFromPdf = async (arrayBuffer: ArrayBuffer) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error;
    }
  };

  // Summarize the PDF once it finishes loading
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsLoading(true);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const text = await extractTextFromPdf(arrayBuffer);
        const response = await callChat(`Briefly summarize the following text, no more than two paragraphs (list key points only): ` + text);
        setResponse(response);
        setPdfText(text);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        setPdfText('Error parsing PDF. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Implement the summary length when the dropdown changes
  useEffect(() => {
    const updateSummary = async () => {
      setResponse("");
      setIsLoading(true);
      const newSummary = await callChat(`Summarize the following text with a ${summaryLength} length response, no more than ${getNumParagraphs(summaryLength)} paragraphs (list key points only): ` + pdfText);
      setResponse(newSummary);
      setIsLoading(false);
    };
    if (pdfText) {
      updateSummary();
    }
  }, [summaryLength]);

  // Render the UI
  return (
    <div className="w-1/3 mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full h-32 border-2 border-dashed rounded-lg mb-6 flex items-center justify-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-500">Reading PDF...</p>
          </div>
        ) : (
          <p className="text-gray-500">
            {isDragging ? 'Drop PDF here' : 'Drag and drop a PDF file here'}
          </p>
        )}
      </div>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleClick(input);
        setInput("");
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your message"
          autoFocus
        />
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Send Message
        </button>
      </form>
      {response && (
        <div className="mt-6">
          <div className="flex items-center gap-4 mb-2 justify-between">
            <h3 className="font-semibold">Summary:</h3>
            <select
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
