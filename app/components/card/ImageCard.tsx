import Card from "./Card";

export type ImageCardProps = {
  children?: React.ReactNode;
  orientation?: "portrait" | "landscape";
  image: React.ReactNode;
};

export default function ImageCard({
  image,
  children,
  orientation = "landscape",
}: ImageCardProps) {
  return (
    <Card>
      <div
        className={
          orientation === "landscape"
            ? "aspect-h-9 aspect-w-16"
            : "aspect-h-5 aspect-w-4"
        }
      >
        {image}
      </div>
      {children}
    </Card>
  );
}
