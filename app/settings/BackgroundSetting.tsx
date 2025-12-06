import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { CloudUploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useSettings } from "./useSettings";

function BackgroundSetting() {
  const { app, update } = useSettings();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert("Image size must be less than 30MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("background", file);

      const response = await fetch("/api/config/background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();

      update("background", url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      update("background", imageUrl.trim());
      setImageUrl("");
    }
  };

  const deleteBackground = async () => {
    if (app.background?.startsWith("/upload/")) {
      try {
        await fetch("/api/config/background", {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete background:", error);
      }
    }

    update("background", "");
  };

  return (
    <div className="row-span-3 flex w-full flex-col space-y-4">
      <Label>Background</Label>

      {/* Upload Section */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="bg-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="bg-upload"
          className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            isUploading
              ? "cursor-not-allowed border-border text-muted-foreground"
              : "hover:bg-surface-hover border-border text-muted-foreground hover:border-primary hover:text-foreground"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <CloudUploadIcon className="mb-3 h-8 w-8" />
            <p className="text-sm">
              {isUploading ? "Uploading..." : "Click to upload image"}
            </p>
          </div>
        </label>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label>Or enter image URL</Label>
        <ButtonGroup className="w-full">
          <InputGroup>
            <InputGroupInput
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </InputGroup>
          <Button onClick={handleUrlSubmit}>Set</Button>
        </ButtonGroup>
      </div>

      {/* Preview */}
      {app.background && app.background.length > 0 && (
        <div className="group relative">
          <img
            src={app.background}
            alt="Background preview"
            className="h-48 w-full rounded-md border border-border object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button onClick={deleteBackground} variant="destructive" size="sm">
              Remove Background
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default BackgroundSetting;
