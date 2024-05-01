const { initializeApp } = require("firebase/app");
const { getStorage, ref, getMetadata } = require("firebase/storage");
const firebaseConfig = require("../config/firebaseConfig");

initializeApp(firebaseConfig);

const storage = getStorage();

const checkIfExistsInFirebase = async (fileUrl) => {
  try {
    const filenameStartIndex = fileUrl.indexOf("/o/") + 3;
    const filenameEndIndex = fileUrl.indexOf("?");

    if (
      !fileUrl ||
      !fileUrl.startsWith(
        "https://firebasestorage.googleapis.com/v0/b/app-data-yo.appspot.com/o/"
      ) ||
      !fileUrl.startsWith("?alt=media", filenameEndIndex)
    ) {
      return false;
    }

    const filename = fileUrl.substring(filenameStartIndex, filenameEndIndex);

    const fileRef = ref(storage, filename);

    const metadata = await getMetadata(fileRef);

    return metadata ? true : false;
  } catch (error) {
    console.error("Error checking file existence in Firebase Storage");
  }
};

module.exports = checkIfExistsInFirebase;
