import ReactModal from "react-modal";
import type { Image } from "~/types";

export default function PhotofinishModal({
  image,
  onClose,
}: {
  image: Image;
  onClose: () => void;
}) {
  const { competition } = image;

  return (
    <ReactModal isOpen={true} onRequestClose={onClose}>
      {image && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <img
              src={`/images/${competition}/${image.filename}`}
              width={1920}
              height={1080}
              alt={image.title}
              className="w-full rounded-t-md"
            />
          </div>
          <div className="flex flex-col gap-2 lg:w-1/3">
            <h3 className="font-wa-headline text-xl text-center">
              {image.title}
            </h3>
            {image.windSpeed && (
              <div className="flex flex-row gap-2">
                <span className="text-lg">Wind: {image.windSpeed}</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left">
                  <tr>
                    <th className="px-4 py-2">Rank</th>
                    {image.event && image.event.distance <= 400 && (
                      <th className="px-4 py-2">Lane</th>
                    )}
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Time</th>
                    {image.athletes.filter((athlete) => athlete.reactionTime)
                      .length > 0 && (
                      <th className="px-4 py-2">Reaction Time</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {image.athletes.map((athlete, key) => (
                    <tr key={key}>
                      <td className="border px-4 py-2">{athlete.rank}</td>
                      {image.event && image.event.distance <= 400 && (
                        <td className="border px-4 py-2">{athlete.lane}</td>
                      )}
                      <td className="border px-4 py-2">
                        {athlete.firstname} {athlete.lastname}
                      </td>
                      <td className="border px-4 py-2">{athlete.time}</td>

                      {athlete.reactionTime && (
                        <td className="border px-4 py-2">
                          {athlete.reactionTime}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ReactModal>
  );
}
