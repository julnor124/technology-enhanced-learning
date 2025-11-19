"use client";

import { useState, type ChangeEvent } from "react";
import { Upload, X, CheckCircle2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskUploadProps {
  onTaskUpload: (task: string) => void;
}

export function TaskUpload({ onTaskUpload }: TaskUploadProps) {
  const [task, setTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log("[TaskUpload] Starting PDF extraction for file:", file.name, file.size);
      // Use server-side API route to parse PDF
      const formData = new FormData();
      formData.append("file", file);

      console.log("[TaskUpload] Sending request to /api/parse-pdf");
      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      console.log("[TaskUpload] Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "Failed to parse PDF";
        try {
          const errorData = await response.json();
          console.error("[TaskUpload] Error response:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error("[TaskUpload] Error text:", errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("[TaskUpload] PDF parsed successfully, text length:", data.text?.length || 0);
      
      if (!data.text) {
        throw new Error("No text extracted from PDF");
      }
      return data.text;
    } catch (error: any) {
      console.error("[TaskUpload] Error extracting PDF text:", error);
      const errorMessage = error?.message || "Unknown error";
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("[TaskUpload] No file selected");
      return;
    }

    console.log("[TaskUpload] File selected:", file.name, file.type, file.size);
    setIsLoading(true);

    try {
      let content = "";

      // Check if it's a PDF file
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        console.log("[TaskUpload] Processing as PDF");
        content = await extractTextFromPDF(file);
      } else {
        console.log("[TaskUpload] Processing as text file");
        // Handle text files (.txt, .md)
        const reader = new FileReader();
        content = await new Promise<string>((resolve, reject) => {
          reader.onload = (loadEvent) => {
            resolve((loadEvent.target?.result as string) ?? "");
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }

      console.log("[TaskUpload] File processed successfully, content length:", content.length);
      
      if (!content || content.trim().length === 0) {
        throw new Error("File appears to be empty");
      }

      setTask(content);
      setUploadedFileName(file.name);
      onTaskUpload(content);
      setUploadSuccess(true);
      console.log("[TaskUpload] State updated - task set, file name:", file.name);

      // Reset the input so the same file can be uploaded again
      event.target.value = "";

      // Show success message briefly
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error("[TaskUpload] Error processing file:", error);
      const errorMessage = error?.message || "Unknown error occurred";

      alert(`Failed to process file: ${errorMessage}\n\nPlease make sure the file is a valid PDF, TXT, or MD file.`);
      setUploadSuccess(false);
      // Reset the input on error too
      event.target.value = "";
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setTask("");
    setUploadedFileName("");
    onTaskUpload("");
    setUploadSuccess(false);
  };

  if (!task) {
    return (
      <label htmlFor="task-upload">
        <Button variant="outline" className="gap-2 cursor-pointer" disabled={isLoading} asChild>
          <span>
            <Upload className="h-4 w-4" />
            {isLoading ? "Processing..." : "Upload Task"}
          </span>
        </Button>
        <input
          id="task-upload"
          type="file"
          accept=".txt,.md,.pdf"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </label>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className={`gap-2 ${uploadSuccess ? "border-green-500 bg-green-50 dark:bg-green-950" : task ? "border-green-500/50" : ""}`}
          disabled
        >
          {task ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {uploadedFileName ? (
            <span className="max-w-[200px] truncate">{uploadedFileName}</span>
          ) : (
            "Task Uploaded"
          )}
        </Button>
        {task && (
          <>
            <div className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900 px-2 py-1">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Ready</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center justify-center rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete uploaded file"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Uploaded File?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the uploaded file? This will remove it from your current session and the AI will no longer have access to it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {uploadSuccess && (
        <div className="absolute right-0 top-12 z-20 mb-2 rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 px-3 py-2 text-sm text-green-700 dark:text-green-300 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>File uploaded successfully! ({task.length} characters)</span>
          </div>
        </div>
      )}
    </div>
  );
}

