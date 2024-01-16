import ContentContainer from "@/components/ContentContainer";
import CompetitionCard from "@/components/card/CompetitionCard";
import { axios } from "@/lib/axios";
import { Event } from "@/types";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";

export const Loader = async () => {
  return (await axios.get("/events")) as Event[];
};
export default function Index() {
  const events = useLoaderData() as Event[];
  const availableLocations = [
    ...new Set(events.map((event) => event.location)),
  ];
  const [location, setLocation] = useState<string>("");
  return (
    <ContentContainer>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-2 justify-end">
          <select
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
            }}
            className="w-max bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Ort</option>
            {availableLocations.map((location, key) => (
              <option key={key} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events
          .filter((event) => {
            if (location == "") return true;
            return event.location == location;
          })
          .map((event, key) => (
            <li key={key}>
              <CompetitionCard {...event} id={event.id} />
            </li>
          ))}
      </ul>
    </ContentContainer>
  );
}
