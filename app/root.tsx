import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import tailwind from "~/tailwind.css";
import fonts from "~/fonts.css";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Title from "./components/Title";
import ContentContainer from "./components/ContentContainer";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
  { rel: "stylesheet", href: fonts },
];

export default function App() {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={`flex min-h-screen flex-col font-wa-regular bg-tourDarkBlue`}
      >
        <Navbar />
        <div className="flex-grow">
          <Outlet />
        </div>
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <html lang="de">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body
          className={`flex min-h-screen flex-col font-wa-regular bg-tourDarkBlue`}
        >
          <Navbar />
          <div className="flex-grow">
            <Title>{error.status === 404 ? "404" : error.status}</Title>
            {error.status !== 404 && (
              <ContentContainer>
                <div className="text-white text-xl">
                  <p>Status: {error.status}</p>
                  <p>Message: {error.data.message}</p>
                </div>
              </ContentContainer>
            )}
          </div>
          <Footer />
          <ScrollRestoration />
          <LiveReload />
        </body>
      </html>
    );
  }
  return (
    <div>
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>??</pre>
    </div>
  );
}
