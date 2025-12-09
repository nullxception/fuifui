import { TRPCError } from "@trpc/server";
import path from "path";
import { UPLOAD_DIR } from "server/dirs";
import sharp from "sharp";

export async function removeBackground() {
  try {
    const filePath = path.join(UPLOAD_DIR, "background.webp");
    await Bun.file(filePath).delete();
    return { filename: "", url: "" };
  } catch {
    //
  }
}

export async function uploadBackground(formData?: FormData) {
  try {
    const file = formData?.get("image");

    if (!file || !(file instanceof File)) {
      return removeBackground();
    }

    const buffer = await file.arrayBuffer();
    const processedImage = await sharp(Buffer.from(buffer))
      .resize(3840, 2160, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = "background.webp";
    await Bun.write(path.join(UPLOAD_DIR, filename), processedImage);

    return {
      filename,
      url: `/upload/${filename}?t=${Date.now()}`,
    };
  } catch (error) {
    console.error("Image processing error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Image processing failed",
      cause: error,
    });
  }
}
