const { initializeApp } = require("firebase/app");
const { getStorage, ref, deleteObject } = require("firebase/storage");
const firebaseConfig = require("../config/firebaseConfig");

initializeApp(firebaseConfig);

const storage = getStorage();

const deleteFromFirebase = async (fileUrl) => {
  try {
    const filenameStartIndex = fileUrl.indexOf("/o/") + 3;
    const filenameEndIndex = fileUrl.indexOf("?");
    const filename = fileUrl.substring(filenameStartIndex, filenameEndIndex);

    const fileRef = ref(storage, filename);

    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting file from Firebase Storage");
  }
};

module.exports = deleteFromFirebase;
