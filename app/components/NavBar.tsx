import { Link } from "@remix-run/react";

export default function Navbar() {
  return (
    <header className="mx-auto flex max-w-screen-xl px-4 2xl:px-0 w-full">
      <nav className="w-full border-gray-200 text-white py-4 text-lg flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex justify-between">
          <Link
            to="/"
            className="self-center whitespace-nowrap font-wa-headline text-xl font-semibold"
          >
            Photofinish
          </Link>
        </div>
      </nav>
    </header>
  );
}
