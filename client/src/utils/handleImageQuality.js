import Resizer from "react-image-file-resizer";

const handleImageQuality = async (file, maxWidth, maxHeight, quality) => {
  return new Promise((resolve, reject) => {
    Resizer.imageFileResizer(
      file,
      maxWidth,
      maxHeight,
      "jpeg",
      quality,
      0,
      (resizedFile) => {
        if (resizedFile) {
          resolve(resizedFile);
        } else {
          reject(new Error("Image resizing failed"));
        }
      },
      "file"
    );
  });
};

export default handleImageQuality;
