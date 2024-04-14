const checkIfExistsInFirebase = async (fileUrl) => {
  try {
    const res = await fetch(fileUrl);
    return res.status === 200;
  } catch (err) {
    return false;
  }
};

module.exports = checkIfExistsInFirebase;
