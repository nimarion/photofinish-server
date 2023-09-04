import fs from "fs";
import path from "path";
import exifr from "exifr";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContentContainer from "~/components/ContentContainer";
import Title from "~/components/Title";
import csv from "csvtojson";

export const loader = async ({ params }: LoaderArgs) => {
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
      const names = await csv({
        delimiter: ";",
      }).fromString(output.Caption).then((jsonObj) => {
        return jsonObj.map((item) => {
          return item.FirstName + " " + item.LastName;
        }).filter((item) => {
          return item.trim() != "";
        });
      })
      return { title, timestamp, url, names };
    })
  );
  const title = competitionId.slice(0, -9);
  return json({ title, images });
};

export default function Index() {
  const { title, images } = useLoaderData<typeof loader>();
  return (
    <ContentContainer>
      <Title>{title}</Title>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images
          .filter((image) => image.title != "")
          .sort((a, b) =>
            a.timestamp < b.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0
          )
          .map((image, key) => (
            <li className="rounded-md bg-white" key={key}>
              <a href={image.url}>
                <div className="aspect-h-9 aspect-w-16">
                  <img
                    src={image.url}
                    width={1920}
                    height={1080}
                    alt={image.title}
                    className="w-full rounded-t-md"
                  />
                </div>
                <div className="ml-4 flex flex-1 flex-col justify-between gap-4 py-4 ">
                  <div className="flex items-center">
                    <span className="block text-sm text-gray-400">
                      {image.timestamp}
                    </span>
                  </div>
                  <h3 className="font-wa-headline text-xl">{image.title}</h3>
                  <p className="text-gray-500"> {image.names.join(", ")}</p>
                </div>
              </a>
            </li>
          ))}
      </ul>
    </ContentContainer>
  );
}
