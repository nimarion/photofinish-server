import ContentContainer from "@/components/ContentContainer";
import CompetitionCard from "@/components/card/CompetitionCard";
import { axios } from "@/lib/axios";
import { Event } from "@/types";
import { useLoaderData } from "react-router-dom";

export const Loader = async () => {
  return (await axios.get("/events")) as Event[];
};
export default function Index() {
  const events = useLoaderData() as Event[];
  return (
    <ContentContainer>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, key) => (
          <li key={key}>
            <CompetitionCard {...event} id={event.id} />
          </li>
        ))}
      </ul>
    </ContentContainer>
  );
}
