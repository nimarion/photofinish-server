import { Link, useSearchParams } from "react-router-dom";
import ImageCard from "./ImageCard";
import { Event } from "@/types";
import { Image } from "@unpic/react";
import { IPX_URL } from "@/config";

export default function CompetitionCard({ id, date, name, location }: Event) {
  const [searchParams] = useSearchParams();
  return (
    <Link to={`/${id}?${searchParams.toString()}`} className="block">
      <ImageCard
        image={
          <Image
            cdn="ipx"
            src={`${IPX_URL}/${id}/thumbnail.jpg`}
            alt={name}
            height={1080}
            width={1920}
          />
        }
      >
        <div className="ml-4 flex flex-1 flex-col justify-between gap-4 py-4 ">
          <div className="flex items-center">
            <span className="block text-sm text-gray-400">
              {new Date(date).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })} - { location}
            </span>
          </div>
          <h3 className="font-wa-headline text-xl">{name}</h3>
        </div>
      </ImageCard>
    </Link>
  );
}
