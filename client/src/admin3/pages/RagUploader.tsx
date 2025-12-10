import { useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { FileText, UploadCloud, CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import { api } from "@/lib/api";

// Define acceptable file types (e.g., PDF, TXT, DOCX)
const ACCEPTED_FILE_TYPES = ".pdf, .txt, .docx, .md";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export default function RagUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputId = "rag-file-upload";

  // Unified file change handler for both input and drag-drop
  const handleFileChange = useCallback((selectedFile: File | null) => {
    setErrorMessage(null);
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setErrorMessage("File size exceeds 10MB limit.");
        setFile(null);
        return;
      }
      // Simple check for file type extension
      const isValidType = ACCEPTED_FILE_TYPES.split(', ').some(type => selectedFile.name.endsWith(type.slice(1)));
      if (!isValidType) {
        setErrorMessage("Invalid file type. Please use PDF, TXT, DOCX, or MD.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile || null);
  };

  const handleUpload = async () => {
    if (!file || status === "uploading") return;

    const formData = new FormData();
    formData.append("file", file);

    setStatus("uploading");
    setErrorMessage(null);

    try {
      // Assuming api wrapper handles headers and baseURL
      const res = await api.post("/rag/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200 || res.status === 201) {
        setStatus("success");
        setFile(null); // Clear file after successful upload
      } else {
        setStatus("failed");
        setErrorMessage(res.data?.message || "Server responded with an error.");
      }
    } catch (error: any) {
      setStatus("failed");
      setErrorMessage(error.response?.data?.message || "Network error or internal server error.");
    }
  };

  const statusAlert = useMemo(() => {
    switch (status) {
      case "uploading":
        return (
          <Alert className="bg-fuchsia-50 border-fuchsia-500 text-fuchsia-700 dark:bg-fuchsia-950 dark:border-fuchsia-700 dark:text-fuchsia-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing...</AlertTitle>
            <AlertDescription>The document is being uploaded and processed for the AI model.</AlertDescription>
          </Alert>
        );
      case "success":
        return (
          <Alert className="bg-green-50 border-green-500 text-green-700 dark:bg-green-950 dark:border-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Upload Complete</AlertTitle>
            <AlertDescription>Document successfully indexed and available for the RAG system.</AlertDescription>
          </Alert>
        );
      case "failed":
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{errorMessage || "An unknown error occurred during upload."}</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  }, [status, errorMessage]);


  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
            <FileText className="mr-3 h-6 w-6" />
            RAG Document Uploader
          </CardTitle>
          <CardDescription>
            Upload documents (PDF, TXT, DOCX, MD) to train the AI's Retrieval-Augmented Generation (RAG) system.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* 1. Status Alert */}
          {statusAlert}

          {/* 2. Drag & Drop Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer 
            ${file ? 'border-fuchsia-500 bg-fuchsia-50/50 dark:bg-fuchsia-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-fuchsia-400'}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
                {file ? file.name : "Drag and drop your file here, or click to select"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
                Accepted: {ACCEPTED_FILE_TYPES} (Max 10MB)
            </p>
            {/* Hidden native input */}
            <Input
              id={fileInputId}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={e => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {/* 3. Action Button and File Info */}
          <div className="flex justify-between items-center pt-2">
            
            {/* File Info */}
            {file && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Info className="h-4 w-4 mr-1.5" />
                    <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                    <span className="ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
            )}
            {!file && (
                <span className="text-sm text-muted-foreground">Select a document to begin.</span>
            )}
            
            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || status === "uploading" || status === "success"}
              className={`
                bg-fuchsia-600 hover:bg-fuchsia-700 text-white 
                ${status === "uploading" ? "opacity-70 cursor-not-allowed" : ""}
                ${!file ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Start Upload"
              )}
            </Button>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}