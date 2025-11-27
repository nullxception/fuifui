import ImageGrid from "./ImageGrid";
import ImageLightbox from "./ImageLightbox";

export default function Gallery() {
  return (
    <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2 scrollbar-thumb-secondary scrollbar-track-transparent">
      <ImageGrid />
      <ImageLightbox />
    </div>
  );
}
