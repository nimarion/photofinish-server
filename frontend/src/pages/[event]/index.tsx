import ContentContainer from "@/components/ContentContainer";
import PhotofinishModal from "@/components/PhotofinishModal";
import Title from "@/components/Title";
import PhotofinishCard from "@/components/card/PhotofinishCard";
import Camera from "@/components/icons/Camera";
import Eyes from "@/components/icons/Eyes";
import Running from "@/components/icons/Running";
import { axios } from "@/lib/axios";
import { wsContext } from "@/provider/ws-context";
import { Event, Image } from "@/types";
import { useContext, useEffect, useState } from "react";
import { useLoaderData, useParams, useSearchParams } from "react-router-dom";

export const Loader = async ({ params }: { params: { event: string } }) => {
  const { event } = params;
  const [eventData, images] = await Promise.all([
    axios.get(`/events/${event}`) as Promise<Event>,
    axios.get(`/events/${event}/images`) as Promise<Image[]>,
  ]);
  if (!eventData) {
    throw new Response("Event not found", { status: 404 });
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
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useLoaderData() as {
    event: Event;
    images: Image[];
    trackEvents: string[];
  };
  const { event, trackEvents } = data;
  const [images, setImages] = useState<Image[]>(data.images);
  const eventId = useParams().event;
  const [watchers, setWatchers] = useState(1);
  const [trackEvent, setTrackEvent] = useState<string>(
    searchParams.has("trackEvent") ? searchParams.get("trackEvent")! : ""
  );
  const [athlete, setAthlete] = useState<string>("");
  const [sorting, setSorting] = useState<"newest" | "oldest">(
    searchParams.has("sorting")
      ? (searchParams.get("sorting")! as "newest" | "oldest")
      : "newest"
  );
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

    socket.on("image.deleted", (data: { filename: string }) => {
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

  useEffect(() => {
    if (image) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [image]);

  const [athletes, setAthletes] = useState<
    {
      firstname: string;
      lastname: string;
      nationality: string;
    }[]
  >([]);
  useEffect(() => {
    const athletes = [] as {
      firstname: string;
      lastname: string;
      nationality: string;
    }[];
    images.forEach((image) => {
      image.athletes.forEach((athlete) => {
        if (athlete.firstname.length == 0 || athlete.lastname.length == 0)
          return;
        const existingAthlete = athletes.find(
          (a) =>
            a.firstname === athlete.firstname && a.lastname === athlete.lastname
        );
        if (existingAthlete) return;
        athletes.push({
          firstname: athlete.firstname,
          lastname: athlete.lastname,
          nationality: athlete.nationality,
        });
      });
    });
    // sort by firstname
    athletes.sort((a, b) => {
      if (a.firstname < b.firstname) {
        return -1;
      }
      if (a.firstname > b.firstname) {
        return 1;
      }
      return 0;
    });
    setAthletes(athletes);
  }, [images]);

  return (
    <ContentContainer>
      <div className="flex flex-col gap-2">
        <Title>{event.name}</Title>
        <h2 className="text-xl font-bold text-white text-center">
          {new Date(event.date).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}{" "}
          - {event.location}
        </h2>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4 ">
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-row  gap-2">
            <span className="text-base text-gray-400 items-center">
              {images.length}
            </span>
            <Camera className="w-6 h-6 pb-1" />
          </div>
          <div className="flex flex-row  gap-2">
            <span className="text-base text-gray-400 items-center">
              {athletes.length}
            </span>
            <Running className="w-6 h-6 pb-1" />
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
              const params = new URLSearchParams(searchParams);
              if (e.target.value != "") {
                params.set("trackEvent", e.target.value);
              } else {
                params.delete("trackEvent");
              }
              setSearchParams(params);
            }}
            className="w-max bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Alle Disziplinen</option>
            {trackEvents.map((trackEvent, key) => (
              <option key={key} value={trackEvent}>
                {trackEvent}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => {
              setSorting(e.target.value as "newest" | "oldest");
              const params = new URLSearchParams(searchParams);
              if (e.target.value != "") {
                params.set("sorting", e.target.value);
              } else {
                params.delete("sorting");
              }
              setSearchParams(params);
            }}
            value={sorting}
            className="w-max bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="newest">Neuste</option>
            <option value="oldest">Älteste</option>
          </select>
          <select
            onChange={(e) => {
              setAthlete(e.target.value);
            }}
            className="w-max bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Alle Athleten</option>
            {athletes.map((athlete, key) => (
              <option
                key={key}
                value={`${athlete.firstname} --- ${athlete.lastname}`}
              >
                {athlete.firstname} {athlete.lastname}
              </option>
            ))}
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
          ).filter((image) => {
            if (athlete == "") return true;
            const [firstname, lastname] = athlete.split(" --- ");
            return image.athletes.some(
              (athlete) =>
                athlete.firstname == firstname && athlete.lastname == lastname
            );
          })
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
      {images.length == 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-3xl font-bold text-white text-center">
            Noch keine Zielbilder vorhanden
          </h2>
        </div>
      )}
    </ContentContainer>
  );
}
