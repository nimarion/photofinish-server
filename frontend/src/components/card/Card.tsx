export default function Card({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg  bg-white shadow-lg">
      {children}
    </div>
  );
}
