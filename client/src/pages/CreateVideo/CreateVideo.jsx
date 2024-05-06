import { useRef, useState, useEffect } from "react";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate } from "../../hooks";
import handleImageQuality from "../../utils/handleImageQuality";
import uploadFileToFirebase from "../../utils/uploadFileToFirebase";
import style from "./CreateVideo.module.css";

const CreateVideo = () => {
  const titleRef = useRef(null);
  const errRef = useRef(null);
  const successRef = useRef(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadThumbnailProgress, setUploadThumbnailProgress] = useState(0);

  const [videoFile, setVideoFile] = useState(null);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [createVideoLoad, setCreateVideoLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    titleRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
    setSuccessMsg("");
  }, [title, desc, thumbnailFile, videoFile]);

  const createVideo = async (e) => {
    e.preventDefault();

    try {
      setCreateVideoLoad(true);

      if (!thumbnailFile || !videoFile) {
        setErrMsg("thumbnail and video files are required");
        errRef.current.focus();
        return;
      }

      // Handle thumbnail file image quality
      const resizedThumbnailFile = await handleImageQuality(
        thumbnailFile,
        750,
        450,
        80
      );

      // Upload thumbnail and video files to firebase storage
      let thumbnailUrl = await uploadFileToFirebase(
        resizedThumbnailFile,
        "thumbnail",
        setUploadThumbnailProgress
      );

      let videoUrl = await uploadFileToFirebase(
        videoFile,
        "video",
        setUploadVideoProgress
      );

      // Create newVideo and send request to the server
      const newVideo = {
        title: title,
        desc: desc,
        thumbnailUrl: thumbnailUrl,
        videoUrl: videoUrl,
      };

      const res = await axiosPrivate.post(`/videos`, newVideo, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      // Set success message
      setSuccessMsg(res.data.message);
      successRef.current.focus();
    } catch (err) {
      // If no server response
      if (!err?.response) setErrMsg("No Server Response");

      // If error message
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg("Create Video Process Failed");
      errRef.current.focus();
    } finally {
      setCreateVideoLoad(false);
    }
  };

  return (
    <section className={style.create_video_page}>
      <form className={style.create_video_form} onSubmit={createVideo}>
        {/* Title */}
        <h2>Create New Video</h2>

        {/* Error Message */}
        <div ref={errRef} aria-live="assertive">
          {errMsg && <p className={style.error_message}>{errMsg}</p>}
        </div>

        {/* Success Message */}
        <div ref={successRef} aria-live="assertive">
          {successMsg && <p className={style.success_message}>{successMsg}</p>}
        </div>

        {/* Title */}
        <input
          type="text"
          autoComplete="off"
          placeholder="Title"
          maxLength={150}
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          required
          ref={titleRef}
        />

        {/* Description */}
        <textarea
          autoComplete="off"
          placeholder="Optional description for video"
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
          required={false}
        ></textarea>

        {/* Upload Thumbnail */}
        <div className={style.thumbnail}>
          <label htmlFor="thumbnailFileInput">Thumbnail: </label>

          <input
            type="file"
            id="thumbnailFileInput"
            accept="image/*"
            multiple={false}
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            required
          />

          {thumbnailFile ? (
            <span className={style.upload_thumbnail_progress}>
              {uploadThumbnailProgress}%
            </span>
          ) : (
            ""
          )}
        </div>

        {/* Upload Video */}
        <div className={style.video}>
          <label htmlFor="videoFileInput">Video: </label>

          <input
            type="file"
            id="videoFileInput"
            accept="video/*"
            multiple={false}
            onChange={(e) => setVideoFile(e.target.files[0])}
            required
          />

          {videoFile ? (
            <span className={style.upload_video_progress}>
              {uploadVideoProgress}%
            </span>
          ) : (
            ""
          )}
        </div>

        {/* Submit Btn */}
        <button
          type="submit"
          disabled={createVideoLoad ? true : false}
          style={createVideoLoad ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          <span>Create</span>
          {createVideoLoad && <MoonLoader color="#000" size={15} />}
        </button>
      </form>
    </section>
  );
};

export default CreateVideo;
