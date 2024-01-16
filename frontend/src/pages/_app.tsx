import ContentContainer from "@/components/ContentContainer";
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import Title from "@/components/Title";
import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useRouteError,
  useSearchParams,
} from "react-router-dom";

export default function App() {
  const [searchParams] = useSearchParams();
  const iframe = searchParams.has("iframe");
  return (
    <div
      className={`flex min-h-screen flex-col font-wa-regular ${
        iframe ? "bg-transparent" : "bg-tourDarkBlue"
      }`}
    >
      {!iframe && <Navbar />}
      <Outlet />
      {!iframe && <Footer />}
    </div>
  );
}

export const Catch = () => {
  const error = useRouteError();
  console.log(error);
  console.log(isRouteErrorResponse(error));
  const [searchParams] = useSearchParams();
  const iframe = searchParams.has("iframe");
  if (!isRouteErrorResponse(error))
    return (
      <div
        className={`flex min-h-screen flex-col font-wa-regular ${
          iframe ? "bg-transparent" : "bg-tourDarkBlue"
        }`}
      >
        {!iframe && <Navbar />}
        <div className="flex-grow">
          <Title>500</Title>
          <ContentContainer>
            <div className="text-white text-xl">
              <p>Status: 500</p>
              <p>Message: Internal Server Error</p>
            </div>
          </ContentContainer>
        </div>
        {!iframe && <Footer />}
      </div>
    );
  return (
    <div
      className={`flex min-h-screen flex-col font-wa-regular ${
        iframe ? "bg-transparent" : "bg-tourDarkBlue"
      }`}
    >
      {!iframe && <Navbar />}
      <div className="flex-grow text-center">
        <Title>{error.status === 404 ? "404" : error.status}</Title>
        {error.status !== 404 && (
          <ContentContainer>
            <div className="text-white text-xl">
              <p>Status: {error.status}</p>
              <p>Message: {error.data.message}</p>
            </div>
          </ContentContainer>
        )}
        {error.status === 404 && (
          <ContentContainer>
            <Link to="/" className="text-white text-xl">
              Zurück zur Startseite
            </Link>
          </ContentContainer>
        )}
      </div>
      {!iframe && <Footer />}
    </div>
  );
};
