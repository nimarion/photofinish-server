import fs from "fs";
import path from "path";
import exifr from "exifr";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContentContainer from "~/components/ContentContainer";
import Title from "~/components/Title";
import csv from "csvtojson";
import ReactModal from "react-modal";
import React, { useEffect } from "react";
import ImageCard from "~/components/card/ImageHard";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const IMAGE_FOLDER = path.join(process.cwd(), "public", "images");
  const competitionId = params.id;
  if (!competitionId) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  if (!fs.existsSync(path.join(IMAGE_FOLDER, competitionId))) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const files = fs
    .readdirSync(path.join(IMAGE_FOLDER, competitionId))
    .filter((file) => {
      return file != "thumbnail.jpg";
    });
  const images = await Promise.all(
    files.map(async (file) => {
      const data = fs.readFileSync(
        "public/images/" + competitionId + "/" + file
      );
      const output = await exifr.parse(data, { iptc: true });
      const url = "/images/" + competitionId + "/" + file;
      const title = output.ObjectName || "";
      const timestamp = output.Headline || 0;
      const csvData = await csv({
        delimiter: ";",
      }).fromString(output.Caption);
      const athletes = csvData
        .filter((item) => item.Rank != "")
        .map((item) => {
          return {
            firstname: item.FirstName,
            lastname: item.LastName,
            rank: item.Rank,
            time: item.Time,
            reactionTime: item.React.Time || null,
          };
        });
      const windData = csvData.find(
        (item) => item.Rank == "" && item.Windspeed != ""
      );
      const wind = windData ? windData.Windspeed : null;
      return { title, timestamp, url, athletes, wind };
    })
  );
  const title = competitionId.slice(0, -9);
  return json({ title, images });
};

export default function Index() {
  const { title, images } = useLoaderData<typeof loader>();
  const [image, setImage] = React.useState({
    url: "",
    title: "",
    athletes: [],
    wind: null,
  } as {
    url: string;
    title: string;
    wind: string | null;
    athletes: {
      firstname: string;
      lastname: string;
      rank: string;
      time: string;
      reactionTime: string | null;
    }[];
  });
  const [open, setOpen] = React.useState(false);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);
  return (
    <ContentContainer>
      <Title>{title}</Title>
      <ReactModal isOpen={open} onRequestClose={() => setOpen(false)}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <img
              src={image.url}
              width={1920}
              height={1080}
              alt={image.title}
              className="w-full rounded-t-md"
            />
          </div>
          <div className="flex flex-col gap-2 lg:w-1/3">
            <h3 className="font-wa-headline text-xl text-center">
              {image.title}
            </h3>
            {image.wind && (
              <div className="flex flex-row gap-2">
                <span className="text-lg">Wind: {image.wind}</span>
              </div>
            )}
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Time</th>
                  {image.athletes.filter((athlete) => athlete.reactionTime)
                    .length > 0 && <th className="px-4 py-2">Reaction Time</th>}
                </tr>
              </thead>
              <tbody>
                {image.athletes.map((athlete, key) => (
                  <tr key={key}>
                    <td className="border px-4 py-2">{athlete.rank}</td>
                    <td className="border px-4 py-2">
                      {athlete.firstname} {athlete.lastname}
                    </td>
                    <td className="border px-4 py-2">{athlete.time}</td>

                    {athlete.reactionTime && (
                      <td className="border px-4 py-2">
                        {athlete.reactionTime}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ReactModal>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images
          .filter((image) => image.title != "")
          .sort((a, b) => {
            if (a.timestamp === 0 && b.timestamp === 0) {
              return 0;
            } else if (a.timestamp === 0) {
              return 1;
            } else if (b.timestamp === 0) {
              return -1;
            } else {
              return a.timestamp > b.timestamp
                ? 1
                : b.timestamp > a.timestamp
                ? -1
                : 0;
            }
          })
          .map((image, key) => (
            <li
              key={key}
              onClick={() => {
                setImage({
                  url: image.url,
                  title: image.title,
                  athletes: image.athletes,
                  wind: image.wind,
                });
                setOpen(true);
              }}
            >
              <ImageCard
                image={{
                  height: 1080,
                  width: 1920,
                  src: image.url,
                  alt: image.title,
                }}
              >
                <div className="ml-4 flex flex-1 flex-col justify-between gap-4 py-4 ">
                  <div className="flex items-center">
                    <span className="block text-sm text-gray-400">
                      {image.timestamp === 0
                        ? "-"
                        : new Date(
                            `1970-01-01T${image.timestamp}Z`
                          ).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                  </div>
                  <h3 className="font-wa-headline text-xl">{image.title}</h3>
                </div>
              </ImageCard>
            </li>
          ))}
      </ul>
    </ContentContainer>
  );
}
