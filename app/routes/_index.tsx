import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fs from "fs";
import path from "path";
import ContentContainer from "~/components/ContentContainer";
import CompetitionCard from "~/components/card/CompetitionCard";

export const loader = async () => {
  const IMAGE_FOLDER = path.join(process.cwd(), "public", "images");
  const folders = fs.readdirSync(IMAGE_FOLDER).filter((folder) => {
    return fs.statSync(path.join(IMAGE_FOLDER, folder)).isDirectory();
  });

  const competitions = folders
    .map((folder) => {
      const hasThumbnail = fs.existsSync(
        path.join(IMAGE_FOLDER, folder, "thumbnail.jpg")
      );
      const thumbnail = "/" + folder + "/thumbnail.jpg";
      const id = folder;
      const name = folder.slice(0, -9);
      const dateString = folder.slice(-8);
      const day = parseInt(dateString.substring(0, 2), 10);
      const month = parseInt(dateString.substring(2, 4), 10) - 1; // Months are zero-based in JavaScript (January is 0)
      const year = parseInt(dateString.substring(4), 10);
      const date = new Date(year, month, day).getTime() / 1000;
      return {
        id,
        name: name === "MTG" ? "MTG: Offene Vereinsmeisterschaften" : name,
        date,
        thumbnail: hasThumbnail ? thumbnail : undefined,
      };
    })
    .sort((a, b) => b.date - a.date);
  return json({ competitions });
};

export default function Index() {
  const { competitions } = useLoaderData<typeof loader>();
  return (
    <ContentContainer>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((competition, key) => (
          <li key={key}>
            <CompetitionCard {...competition} id={competition.id} />
          </li>
        ))}
      </ul>
    </ContentContainer>
  );
}
