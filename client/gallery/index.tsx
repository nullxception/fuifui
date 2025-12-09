import { Footer } from "client/components/Footer";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import type { Image } from "server/types";
import { Link, useRoute } from "wouter";
import ImageLightbox from "./ImageLightbox";
import { useImageQuery } from "./useImageQuery";

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry === undefined) return;
      setWidth(entry.contentRect.width);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
interface GalleryItemProps {
  image: Image;
}

function GalleryItem({ image }: GalleryItemProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();

  // derive appropriate thumbnail size based on real width
  const size = (() => {
    if (width < 192) return 192;
    if (width < 320) return 320;
    if (width < 480) return 480;
    return 512;
  })();

  return (
    <div
      ref={ref}
      className="group bg-surface relative cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/50"
    >
      {width > 1 ? (
        <img
          src={`${image.url}?width=${size}`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <></>
      )}
    </div>
  );
}

const Gallery = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => {
    const {
      data,
      error,
      fetchNextPage,
      hasNextPage,
      isFetching,
      isFetchingNextPage,
      status,
      images,
    } = useImageQuery();
    const [match] = useRoute("/gallery");
    const [, params] = useRoute("/gallery/:id");
    const [appScrollTop, setAppScrollTop] = useState(0);
    const observerTarget = useRef(null);

    useEffect(() => {
      const app = document.querySelector("#app");
      if (match && app && appScrollTop > 0) {
        // scroll saved scrollTop after going back from /gallery/:id
        app.scrollTop = appScrollTop;
      }
    }, [match, appScrollTop]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting && hasNextPage && !isFetching) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 },
      );

      const currentTarget = observerTarget.current;
      if (currentTarget) {
        observer.observe(currentTarget);
      }

      return () => {
        if (currentTarget) {
          observer.unobserve(currentTarget);
        }
      };
    }, [hasNextPage, isFetching, fetchNextPage]);

    if (images.length === 0 && !isFetchingNextPage) {
      return (
        <>
          <motion.div
            ref={ref}
            {...props}
            className="flex h-full flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-background/50 p-2 text-foreground">
              <ImageIcon className="h-12 w-12" />
            </div>
            <p className="text-lg font-medium text-foreground">No images yet</p>
            <p className="text-sm text-muted-foreground">
              Generated images will appear here
            </p>
          </motion.div>
          <Footer />
        </>
      );
    }

    return (
      <>
        <motion.div ref={ref} {...props} className="grow p-2">
          {status === "pending" ? (
            <div className="col-span-full flex justify-center p-4">
              <span className="text-foreground">Loading...</span>
            </div>
          ) : status === "error" ? (
            <div className="col-span-full flex justify-center p-4">
              <span className="text-foreground">Error: {error.message}</span>
            </div>
          ) : (
            <>
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 2, 512: 3, 720: 4, 900: 5 }}
                gutterBreakPoints={{ 350: "6px", 720: "12px" }}
                className="mx-auto max-w-screen-2xl"
              >
                <Masonry>
                  {data.pages.map((group) =>
                    group.map((image, i) => (
                      <Link
                        key={i}
                        href={`~/gallery/${image.name}`}
                        state={{ from: "~/gallery" }}
                        onClick={() => {
                          const app = document.querySelector("#app");
                          setAppScrollTop(app?.scrollTop ?? 0);
                        }}
                        className="w-full"
                      >
                        <GalleryItem image={image} />
                      </Link>
                    )),
                  )}
                </Masonry>
              </ResponsiveMasonry>
              <div ref={observerTarget} className="col-span-full h-10 w-full" />
              {isFetchingNextPage && (
                <div className="col-span-full flex justify-center p-4">
                  <span className="text-foreground">Loading more...</span>
                </div>
              )}
              <Footer className="col-span-full flex justify-center p-4" />
            </>
          )}
        </motion.div>
        <AnimatePresence>{params?.id && <ImageLightbox />}</AnimatePresence>
      </>
    );
  },
);

export default Gallery;
