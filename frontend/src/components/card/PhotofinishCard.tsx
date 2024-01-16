import Image from "../Image";
import ImageCard from "./ImageCard";
import { Image as ImageType } from "@/types";

export default function PhotofinishCard({ image }: { image: ImageType }) {
  return (
    <ImageCard
      image={
        <Image
          src={`/${image.eventId}/${image.filename}`}
          alt={image.title}
          width={1920}
          height={1080}
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
