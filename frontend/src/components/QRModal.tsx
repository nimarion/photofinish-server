import { useEffect, useState } from "react";
import QRCode from "qrcode";
import ReactModal from "react-modal";
import OutsideClickHandler from "./OutsideClickHandler";

export default function QRC({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 300 }, (err, dataUrl) => {
      if (err) console.error(err);

      setDataUrl(dataUrl);
    });
  }, [url]);
  if (!dataUrl) return <></>;
  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      className="flex justify-center items-center  translate-y-1/2"
    >
      <OutsideClickHandler onOutsideClick={onClose}>
        <img src={dataUrl} alt="qr code" />
      </OutsideClickHandler>
    </ReactModal>
  );
}
