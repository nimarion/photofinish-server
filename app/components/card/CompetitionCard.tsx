import fallbackThumbnail from "~/assets/fallbackThumbnail.jpg";
import Image from "../Image";
import ImageCard from "./ImageCard";
import { Link, useSearchParams } from "@remix-run/react";

interface CompetitionCardProps {
  id: string;
  name: string;
  date: number;
  thumbnail?: string;
}

export default function CompetitionCard({
  id,
  name,
  date,
  thumbnail,
}: CompetitionCardProps) {
  const [searchParams] = useSearchParams();
  return (
    <Link to={`/${id}?${searchParams.toString()}`} className="block">
      <ImageCard
        image={
          thumbnail ? (
            <Image src={thumbnail} alt={name} height={1080} width={1920} />
          ) : (
            <img src={fallbackThumbnail} alt={name} />
          )
        }
      >
        <div className="ml-4 flex flex-1 flex-col justify-between gap-4 py-4 ">
          <div className="flex items-center">
            <span className="block text-sm text-gray-400">
              {new Date(date * 1000).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          <h3 className="font-wa-headline text-xl">{name}</h3>
        </div>
      </ImageCard>
    </Link>
  );
}
