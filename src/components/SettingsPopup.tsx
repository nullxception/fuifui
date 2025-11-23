import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Card } from "./ui/Card";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { BackgroundSettings } from "../stores";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bg: BackgroundSettings;
  setBg: (
    settings:
      | BackgroundSettings
      | ((prev: BackgroundSettings) => BackgroundSettings),
  ) => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
  isOpen,
  onClose,
  bg,
  setBg,
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

      setBg((prev) => ({
        ...prev,
        type: "upload",
        image: url,
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
      setBg((prev) => ({
        ...prev,
        type: "url",
        image: imageUrl.trim(),
      }));
      setImageUrl("");
    }
  };

  const deleteBackground = async () => {
    if (bg.type === "upload" && bg.image) {
      try {
        await fetch("/api/background", {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete background:", error);
      }
    }

    setBg({ type: "none", image: "" });
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
            <XMarkIcon className="w-4 h-4" />
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
                  <CloudArrowUpIcon className="w-8 h-8 mb-3" />
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
            {bg.image && (
              <div className="relative group">
                <img
                  src={bg.image}
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
