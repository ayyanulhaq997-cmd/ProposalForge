import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUp, FileText, FileImage, Trash2 } from "lucide-react";

export function AdminChatFiles() {
  const [files] = useState([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat File Uploads</CardTitle>
        <CardDescription>Manage media shared in host-guest conversations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded bg-muted/50 text-center">
            <FileImage className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="font-medium">Images</p>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Uploaded images</p>
          </div>
          <div className="p-4 border rounded bg-muted/50 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="font-medium">Documents</p>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">PDFs and documents</p>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileUp className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No files uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Users can upload images and documents in chat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file: any) => (
              <div key={file.id} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center gap-3">
                  {file.fileType.includes("image") ? (
                    <FileImage className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">{file.fileType}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
