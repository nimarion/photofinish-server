import ContentContainer from "@/components/ContentContainer";
import Title from "@/components/Title";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex-grow text-center">
      <Title>404</Title>
      <ContentContainer>
        <Link to="/" className="text-white text-xl">
          Zurück zur Startseite
        </Link>
      </ContentContainer>
    </div>
  );
}
