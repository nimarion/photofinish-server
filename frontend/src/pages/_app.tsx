import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import { Outlet, useSearchParams } from "react-router-dom";

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
