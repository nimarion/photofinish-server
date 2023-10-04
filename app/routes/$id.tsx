import fs from "fs";
import path from "path";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import ContentContainer from "~/components/ContentContainer";
import Title from "~/components/Title";
import { useContext, useEffect, useState } from "react";
import { wsContext } from "~/ws-context";
import Eyes from "~/components/icons/Eyes";
import { parseIptcFromFile } from "~/services/iptc.parser";
import type { Image as ImageType } from "~/types";
import PhotofinishModal from "~/components/PhotofinishModal";
import PhotofinishCard from "~/components/card/PhotofinishCard";

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
    }) as ImageType[];

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

  const [image, setImage] = useState<ImageType | null>(null);
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

      {image && (
        <PhotofinishModal image={image} onClose={() => setImage(null)} />
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedImages
          .filter((image) =>
            event == "" ? true : image.event && image.event.event == event
          )
          .map((image, key) => (
            <li
              key={key}
              onClick={() => {
                setImage(image);
              }}
            >
              <PhotofinishCard image={image} />
            </li>
          ))}
      </ul>
    </ContentContainer>
  );
}
