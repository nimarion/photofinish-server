import fs from "fs";
import path from "path";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import ContentContainer from "~/components/ContentContainer";
import Title from "~/components/Title";
import ReactModal from "react-modal";
import { useContext, useEffect, useState } from "react";
import ImageCard from "~/components/card/ImageHard";
import { wsContext } from "~/ws-context";
import Eyes from "~/components/icons/Eyes";
import { parseIptcFromFile } from "~/services/iptc.parser";
import type { Image } from "~/types";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const IMAGE_FOLDER = path.join(process.cwd(), "public", "images");
  const competitionId = params.id as string;
  if (!fs.existsSync(path.join(IMAGE_FOLDER, competitionId))) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const files = fs
    .readdirSync(path.join(IMAGE_FOLDER, competitionId))
    .filter((file) => {
      return file.endsWith(".jpg") || file.endsWith(".jpeg");
    })
    .filter((file) => {
      return file != "thumbnail.jpg";
    });
  const images = (
    await Promise.all(
      files.map(async (file) => {
        const data = await parseIptcFromFile(
          "public/images/" + competitionId + "/" + file
        );
        return data;
      })
    )
  )
    .filter((image) => image != null)
    .sort((a, b) => {
      if (a == null || b == null) return 0;
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
    }) as Image[];

  const title = competitionId.slice(0, -9);
  const events = [
    ...new Set(
      images
        .map((image) => {
          if (image.event) {
            return image.event.event;
          }
          return null;
        })
        .filter((event) => event != null)
    ),
  ] as string[];
  return json({
    title: title === "MTG" ? "MTG: Offene Vereinsmeisterschaften" : title,
    images: images.filter((image) => image != null),
    events,
  });
};

export default function Index() {
  const id = useParams().id as string;
  const { title, images, events } = useLoaderData<typeof loader>();
  const [watchers, setWatchers] = useState(1);
  const [sorting, setSorting] = useState<"newest" | "oldest">("newest");
  const [event, setEvent] = useState<string>("");
  const sortedImages = sorting === "newest" ? [...images].reverse() : images;

  let socket = useContext(wsContext);
  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", id);
    socket.on("imageChange", (image: string) => {
      window.location.reload();
    });
    socket.on("watchers", (watchers: number) => {
      if (!watchers || isNaN(watchers)) return;
      setWatchers(watchers);
    });
    return () => {
      if (!socket) return;
      socket.off("imageChange");
      socket.emit("leaveRoom", id);
    };
  }, [socket, id]);

  const [image, setImage] = useState<Image | null>(null);
  useEffect(() => {
    if (image) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [image]);
  return (
    <ContentContainer>
      <Title>{title}</Title>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2">
          <span className="text-base text-gray-400 items-center">
            {watchers}
          </span>
          <Eyes className="w-6 h-6 mb-0.5" />
        </div>
        <div className="flex flex-row gap-2">
          <select
            value={event}
            onChange={(e) => {
              setEvent(e.target.value);
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">All Events</option>
            {events.map((event, key) => (
              <option key={key} value={event}>
                {event}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => {
              setSorting(e.target.value as "newest" | "oldest");
            }}
            value={sorting}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <ReactModal isOpen={image != null} onRequestClose={() => setImage(null)}>
        {image && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <img
                src={`/images/${id}/${image.filename}`}
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
              {image.windSpeed && (
                <div className="flex flex-row gap-2">
                  <span className="text-lg">Wind: {image.windSpeed}</span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left">
                    <tr>
                      <th className="px-4 py-2">Rank</th>
                      {image.event && image.event.distance <= 400 && (
                        <th className="px-4 py-2">Lane</th>
                      )}
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Time</th>
                      {image.athletes.filter((athlete) => athlete.reactionTime)
                        .length > 0 && (
                        <th className="px-4 py-2">Reaction Time</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {image.athletes.map((athlete, key) => (
                      <tr key={key}>
                        <td className="border px-4 py-2">{athlete.rank}</td>
                        {image.event && image.event.distance <= 400 && (
                          <td className="border px-4 py-2">{athlete.lane}</td>
                        )}
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
          </div>
        )}
      </ReactModal>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedImages.filter((image) => event == "" ? true : image.event && image.event.event == event).map((image, key) => (
          <li
            key={key}
            onClick={() => {
              setImage(image);
            }}
          >
            <ImageCard
              image={{
                height: 1080,
                width: 1920,
                src: `/images/${id}/${image.filename}`,
                alt: image.title,
              }}
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
          </li>
        ))}
      </ul>
    </ContentContainer>
  );
}
