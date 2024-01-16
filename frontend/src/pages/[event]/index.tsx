import ContentContainer from "@/components/ContentContainer";
import PhotofinishModal from "@/components/PhotofinishModal";
import Title from "@/components/Title";
import PhotofinishCard from "@/components/card/PhotofinishCard";
import Camera from "@/components/icons/Camera";
import Eyes from "@/components/icons/Eyes";
import { axios } from "@/lib/axios";
import { wsContext } from "@/provider/ws-context";
import { Event, Image } from "@/types";
import { useContext, useEffect, useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";

export const Loader = async ({ params }: { params: { event: string } }) => {
  const { event } = params;
  const eventData = (await axios.get(`/events/${event}`)) as Event;
  const images = (await axios.get(`/events/${event}/images`)) as Image[];
  if (!eventData) {
    return null;
  }
  const trackEvents = [
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
  return {
    event: eventData,
    images,
    trackEvents,
  };
};

export default function EventPage() {
  const data = useLoaderData() as {
    event: Event;
    images: Image[];
    trackEvents: string[];
  };
  const { event, trackEvents } = data;
  const [images, setImages] = useState<Image[]>(data.images);
  const eventId = useParams().event;
  const [watchers, setWatchers] = useState(1);
  const [trackEvent, setTrackEvent] = useState<string>("");
  const [sorting, setSorting] = useState<"newest" | "oldest">("newest");
  const sortedImages = sorting === "newest" ? [...images].reverse() : images;
  const [image, setImage] = useState<Image | null>(null);
  const socket = useContext(wsContext);
  useEffect(() => {
    if (!socket) return;
    socket.emit("joinEvent", eventId);
    socket.on("watchers", (watchers: number) => {
      if (!watchers || isNaN(watchers)) return;
      setWatchers(watchers);
    });
    socket.on("image.created", (image: Image) => {
      setImages((images) => [...images, image]);
    });
    socket.on("image.updated", (image: Image) => {
      setImages((images) =>
        images.map((i) => {
          if (i.filename == image.filename) {
            return image;
          }
          return i;
        })
      );
    });
    
    socket.on("image.deleted", (data: any) => {
      const { filename } = data;
      setImages((images) => images.filter((i) => i.filename != filename));
    });
    return () => {
      if (!socket) return;
      socket.off("image.created");
      socket.off("image.updated");
      socket.off("image.deleted");
      socket.emit("leaveEvent", eventId);
    };
  }, [socket, eventId]);
  return (
    <ContentContainer>
      <Title>{event.name}</Title>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-row  gap-2">
            <span className="text-base text-gray-400 items-center">
              {images.length}
            </span>
            <Camera className="w-6 h-6 pb-1" />
          </div>
          <div className="flex flex-row gap-2">
            <span className="text-base text-gray-400 items-center">
              {watchers}
            </span>
            <Eyes className="w-6 h-6 pb-0.5" />
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <select
            value={trackEvent}
            onChange={(e) => {
              setTrackEvent(e.target.value);
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">All Events</option>
            {trackEvents.map((trackEvent, key) => (
              <option key={key} value={trackEvent}>
                {trackEvent}
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
            trackEvent == ""
              ? true
              : image.event && image.event.event == trackEvent
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
