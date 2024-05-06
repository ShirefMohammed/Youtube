const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
} = require("firebase/storage");
const firebaseConfig = require("../config/firebaseConfig");
const UserModel = require("../models/userModel");
const VideoModel = require("../models/videoModel");
const deleteFromFirebase = require("./deleteFromFirebase");

initializeApp(firebaseConfig);

const storage = getStorage();

const handleUnusedFirebaseFiles = async () => {
  try {
    // Fetch all files from Firebase Storage
    const storageRef = ref(storage);
    const { items } = await listAll(storageRef);

    // Iterate through each file URL
    for (const item of items) {
      const fileUrl = await getDownloadURL(item);

      if (
        !(await UserModel.exists({ avatarUrl: fileUrl })) &&
        !(await VideoModel.exists({ thumbnailUrl: fileUrl })) &&
        !(await VideoModel.exists({ videoUrl: fileUrl })) &&
        item.fullPath !== "defaultAvatar.png"
      ) {
        await deleteFromFirebase(fileUrl);
        console.log("File is deleted from firebase:", fileUrl);
      }
    }
  } catch (error) {
    console.error("Error handling unused Firebase files:", error);
  }
};

module.exports = handleUnusedFirebaseFiles;
