import { Image } from "@unpic/react";
import ImageCard from "./ImageCard";
import { Image as ImageType } from "@/types";
import { IPX_URL } from "@/config";

export default function PhotofinishCard({ image }: { image: ImageType }) {
  return (
    <ImageCard
      image={
        <Image
          cdn="ipx"
          src={`${IPX_URL}/${image.eventId}/${image.filename}`}
          alt={image.title}
          width={image.width}
          height={image.height}
        />
      }
    >
      <div className="ml-4 flex flex-1 flex-col justify-between gap-4 py-4 ">
        <div className="flex items-center">
          <span className="block text-sm text-gray-400">
            {image.timestamp
              ? new Date(image.timestamp).toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </span>
        </div>
        <h3 className="font-wa-headline text-xl">{image.title}</h3>
      </div>
    </ImageCard>
  );
}
