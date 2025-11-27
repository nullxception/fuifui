import path from "path";
import sharp from "sharp";
import { UPLOAD_DIR } from "../constants";

const process = async (
  file: File,
): Promise<{
  filename: string;
  url: string;
}> => {
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
};

export const uploadBackground = async (request?: Request) => {
  if (!request) throw new Error("Request is required for this endpoint");
  try {
    const formData = await request.formData();
    const file = formData.get("background");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const result = await process(file);
    return Response.json(result);
  } catch (error) {
    console.error("Image processing error:", error);
    return Response.json({ error: "Image processing failed" }, { status: 500 });
  }
};

export const removeBackground = async () => {
  try {
    const filePath = path.join(UPLOAD_DIR, "background.webp");
    await Bun.file(filePath).delete();
    return Response.json({
      success: true,
      message: "Background deleted",
    });
  } catch {
    return Response.json({ error: "Background not found" }, { status: 404 });
  }
};
