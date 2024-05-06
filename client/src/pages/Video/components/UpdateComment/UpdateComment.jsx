/* eslint-disable react/prop-types */
import { useRef, useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import style from "./UpdateComment.module.css";

const UpdateComment = ({
  comment,
  videoComments,
  setVideoComments,
  setOpenUpdateComment,
}) => {
  const contentRef = useRef(null);
  const errRef = useRef(null);
  const successRef = useRef(null);

  const [content, setContent] = useState(comment.content);
  const [updateCommentLoad, setUpdateCommentLoad] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  // Focus on comment content textarea
  useEffect(() => {
    contentRef.current.focus();
  }, []);

  // Rest error ans success messages while changing content
  useEffect(() => {
    setErrMsg("");
    setSuccessMsg("");
  }, [content]);

  const updateComment = async (e) => {
    e.preventDefault();

    try {
      if (!content) return notify("info", "Enter comment content");

      setUpdateCommentLoad(true);

      const res = await axiosPrivate.patch(
        `videos/${comment.video._id}/comments/${comment._id}`,
        { content: content }
      );

      setVideoComments(
        videoComments.map((commentItem) =>
          commentItem._id !== comment._id ? commentItem : res.data.data
        )
      );

      setSuccessMsg(res.data.message);
      successRef.current.focus();
    } catch (err) {
      if (!err?.response) setErrMsg("No Server Response");
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg("Comment is not updated");
      errRef.current.focus();
    } finally {
      setUpdateCommentLoad(false);
    }
  };

  return (
    <div className={style.update_comment}>
      <form onSubmit={updateComment}>
        <h2>Update Comment</h2>

        <button
          type="button"
          className={style.close_btn}
          onClick={() => setOpenUpdateComment(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>

        <div ref={errRef} aria-live="assertive">
          {errMsg && <p className={style.error_message}>{errMsg}</p>}
        </div>

        <div ref={successRef} aria-live="assertive">
          {successMsg && <p className={style.success_message}>{successMsg}</p>}
        </div>

        <textarea
          name="content"
          id="content"
          placeholder="Enter comment content"
          required={true}
          onChange={(e) => setContent(e.target.value)}
          value={content}
          ref={contentRef}
        ></textarea>

        <button
          type="submit"
          disabled={updateCommentLoad ? true : false}
          style={updateCommentLoad ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          <span>Save Updates</span>
          {updateCommentLoad && <MoonLoader color="#000" size={15} />}
        </button>
      </form>
    </div>
  );
};

export default UpdateComment;
