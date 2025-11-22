import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Card } from "./ui/Card";

interface BackgroundSettings {
  imageType: "none" | "upload" | "url";
  imageData: string;
}

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundSettings: BackgroundSettings;
  setBackgroundSettings: (
    settings:
      | BackgroundSettings
      | ((prev: BackgroundSettings) => BackgroundSettings),
  ) => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
  isOpen,
  onClose,
  backgroundSettings,
  setBackgroundSettings,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("Image size must be less than 20MB");
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

      const response = await fetch("/api/background/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();

      setBackgroundSettings((prev) => ({
        ...prev,
        imageType: "upload",
        imageData: url,
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setBackgroundSettings((prev) => ({
        ...prev,
        imageType: "url",
        imageData: imageUrl.trim(),
      }));
      setImageUrl("");
    }
  };

  const deleteBackground = async () => {
    if (
      backgroundSettings.imageType === "upload" &&
      backgroundSettings.imageData
    ) {
      try {
        await fetch("/api/background", {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete background:", error);
      }
    }

    setBackgroundSettings({
      imageType: "none",
      imageData: "",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto bg-surface border-border shadow-2xl">
        <div className="flex flex-row items-center justify-between border-b border-border sticky top-0 bg-surface z-10 space-y-1.5 p-2">
          <div className="font-semibold leading-none tracking-tight px-2">
            Settings
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        <div className="space-y-6 p-4">
          <div className="space-y-4">
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
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isUploading
                    ? "border-border text-muted-foreground cursor-not-allowed"
                    : "border-border hover:border-primary hover:bg-surface-hover text-muted-foreground hover:text-white"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm">
                    {isUploading ? "Uploading..." : "Click to upload image"}
                  </p>
                </div>
              </label>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label>Or enter image URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl.trim()}
                  variant="secondary"
                >
                  Set
                </Button>
              </div>
            </div>

            {/* Preview */}
            {backgroundSettings.imageData && (
              <div className="relative group">
                <img
                  src={backgroundSettings.imageData}
                  alt="Background preview"
                  className="w-full h-48 object-cover rounded-md border border-border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                  <Button onClick={deleteBackground} variant="danger" size="sm">
                    Remove Background
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPopup;
