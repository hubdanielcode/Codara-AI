import {
  centerCrop,
  makeAspectCrop,
  ReactCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import { useThemeContext } from "../hooks/useThemeContext";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface PhotoCropModalProps {
  imageSrc: string;
  onConfirm: (imageSrc: string) => void;
  onClose: () => void;
}

const PhotoCropModal = ({
  imageSrc,
  onConfirm,
  onClose,
}: PhotoCropModalProps) => {
  /* - Puxando do context - */

  const { theme } = useThemeContext();

  /* - Estados do crop - */

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  /* - Criando a referência para guardar a imagem original - */

  const ImageRef = useRef<HTMLImageElement | null>(null);

  /* - Funções - */

  // 1. Função para criar o crop centralizado assim que a imagem carregar

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 50,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    );

    setCrop(crop);
  };

  // 2. Função para recortar a imagem

  const getCroppedImage = () => {
    if (!ImageRef.current || !completedCrop) return;

    const image = ImageRef.current;

    /* - Escala entre imagem real e exibida - */

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    /* - Criando o Canvas - */

    const canvas = document.createElement("canvas");

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    canvasContext.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const result = canvas.toDataURL();

    return result;
  };

  return (
    <div className="flex flex-col flex-1 justify-center items-center min-h-screen w-full fixed inset-0 z-50 bg-black/60">
      {/* - Layout do modal - */}
      <div
        className={`flex flex-col items-center justify-center w-fit max-w-[70vh] gap-4 p-6 border rounded-xl ${theme === "Dark" ? "text-white bg-zinc-950 border-zinc-800" : "text-black bg-stone-200 border-stone-600"}`}
      >
        <ReactCrop
          className="max-h-[60vh]"
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
          circularCrop
          keepSelection
          aspect={1}
        >
          <img
            className="max-w-full object-contain"
            src={imageSrc}
            ref={ImageRef}
            onLoad={onImageLoad}
          />
        </ReactCrop>

        <motion.div className="flex items-center justify-around w-full my-3">
          <motion.button
            className="bg-blue-600 px-4 py-2 text-white font-semibold text-lg border border-blue-700 rounded-lg cursor-pointer"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              const result = getCroppedImage();
              if (result) onConfirm(result);
            }}
          >
            Confirmar
          </motion.button>

          <motion.button
            className="bg-red-600 px-4 py-2 text-white font-semibold text-lg border border-red-700 rounded-lg cursor-pointer"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClose}
          >
            Cancelar
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export { PhotoCropModal };
