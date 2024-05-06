import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import firebaseConfig from "../config/firebaseConfig";

initializeApp(firebaseConfig);

const storage = getStorage();

const uploadFileToFirebase = async (file, fileType, setProgress) => {
  try {
    const randomPayload = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = file.name.split(".").pop();

    let fileName;

    if (fileType === "avatar") {
      fileName = `user-${randomPayload}.${fileExtension}`;
    } else if (fileType === "thumbnail") {
      fileName = `thumbnail-${randomPayload}.${fileExtension}`;
    } else if (fileType === "video") {
      fileName = `video-${randomPayload}.${fileExtension}`;
    } else {
      fileName = `file-${randomPayload}.${fileExtension}`;
    }

    // Create a reference to the storage location
    const storageRef = ref(storage, fileName);

    // Upload the file to Cloud Storage
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Track upload progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.round(progress));
      },
      (error) => {
        console.error("Error uploading file:", error);
      },
      () => {
        console.log("Upload file is completed");
      }
    );

    // Wait for the upload to complete
    await uploadTask;

    // Get the download URL for the uploaded file
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    // Return file URL
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Rethrow the error to handle it in the caller function
  }
};

export default uploadFileToFirebase;
