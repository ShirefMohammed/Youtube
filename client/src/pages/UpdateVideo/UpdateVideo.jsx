import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { useAxiosPrivate, useHandleErrors } from "../../hooks";
import handleImageQuality from "../../utils/handleImageQuality";
import uploadFileToFirebase from "../../utils/uploadFileToFirebase";
import style from "./UpdateVideo.module.css";

const UpdateVideo = () => {
  const { videoId } = useParams();

  const errRef = useRef(null);
  const successRef = useRef(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadThumbnailProgress, setUploadThumbnailProgress] = useState(0);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [fetchVideoLoad, setFetchVideoLoad] = useState(false);
  const [updateVideoLoad, setUpdateVideoLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

  useEffect(() => {
    setErrMsg("");
    setSuccessMsg("");
  }, [title, desc, thumbnailFile]);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setFetchVideoLoad(true);
        const res = await axiosPrivate.get(`videos/${videoId}`);
        setTitle(res.data.data.title);
        setDesc(res.data.data.desc);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchVideoLoad(false);
      }
    };

    fetchVideoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateVideo = async (e) => {
    e.preventDefault();

    try {
      setUpdateVideoLoad(true);

      let thumbnailUrl = null;

      if (thumbnailFile) {
        // Handle thumbnail file image quality
        const resizedThumbnailFile = await handleImageQuality(
          thumbnailFile,
          750,
          450,
          80
        );

        // Upload thumbnail file to firebase storage
        thumbnailUrl = await uploadFileToFirebase(
          resizedThumbnailFile,
          "thumbnail",
          setUploadThumbnailProgress
        );
      }

      // Create updatedVideo and send request to the server
      const updatedVideo = {
        desc: desc,
        thumbnailUrl: thumbnailUrl,
      };

      const res = await axiosPrivate.patch(`/videos/${videoId}`, updatedVideo, {
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
      message ? setErrMsg(message) : setErrMsg("Update Video Process Failed");
      errRef.current.focus();
    } finally {
      setUpdateVideoLoad(false);
    }
  };

  return (
    <section className={style.update_video_page}>
      {!fetchVideoLoad ? (
        <form className={style.update_video_form} onSubmit={updateVideo}>
          {/* Title */}
          <h2>Update The Video</h2>

          {/* Error Message */}
          <div ref={errRef} aria-live="assertive">
            {errMsg && <p className={style.error_message}>{errMsg}</p>}
          </div>

          {/* Success Message */}
          <div ref={successRef} aria-live="assertive">
            {successMsg && (
              <p className={style.success_message}>{successMsg}</p>
            )}
          </div>

          {/* Disabled Title Input Field */}
          <input type="text" value={title} disabled />

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
              required={false}
            />

            {thumbnailFile ? (
              <span className={style.upload_thumbnail_progress}>
                {uploadThumbnailProgress}%
              </span>
            ) : (
              ""
            )}
          </div>

          {/* Disabled Video Input Field */}
          <div className={style.video}>
            <label htmlFor="videoFileInput">Video: </label>

            <input
              type="file"
              id="videoFileInput"
              accept="video/*"
              multiple={false}
              disabled
            />
          </div>

          {/* Submit Btn */}
          <button
            type="submit"
            disabled={updateVideoLoad ? true : false}
            style={updateVideoLoad ? { opacity: 0.5, cursor: "revert" } : {}}
          >
            <span>Update</span>
            {updateVideoLoad && <MoonLoader color="#000" size={15} />}
          </button>
        </form>
      ) : (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      )}
    </section>
  );
};

export default UpdateVideo;
