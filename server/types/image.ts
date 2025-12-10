export interface Image {
  name: string;
  url: string;
  mtime: number;
  width: number;
  height: number;
  metadata: string;
}

export interface ExifImage {
  ImageWidth?: number;
  ImageHeight?: number;
  parameters?: string;
}
