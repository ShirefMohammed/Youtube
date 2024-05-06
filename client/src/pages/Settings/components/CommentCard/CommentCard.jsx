/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import UpdateComment from "../UpdateComment/UpdateComment";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import style from "./CommentCard.module.css";

const CommentCard = ({ comment, comments, setComments }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openUpdateComment, setOpenUpdateComment] = useState(false);
  const [viewMoreContent, setViewMoreContent] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const deleteComment = async (videoId, commentId) => {
    try {
      setDeleteLoading(true);
      await axiosPrivate.delete(`/videos/${videoId}/comments/${commentId}`);
      setComments(comments.filter((comment) => comment._id !== commentId));
      notify("success", "Comment is deleted");
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={style.comment_card}>
      {/* Comment Content */}
      <div className={style.comment_content}>
        {comment.content.length > 100 ? (
          <pre>
            {viewMoreContent
              ? comment.content
              : comment.content.substring(0, 101)}
            {viewMoreContent ? (
              <button type="button" onClick={() => setViewMoreContent(false)}>
                Show less
              </button>
            ) : (
              <button type="button" onClick={() => setViewMoreContent(true)}>
                ...more
              </button>
            )}
          </pre>
        ) : (
          <pre>{comment.content}</pre>
        )}
      </div>

      {/* Comment Created At */}
      <span className={style.created_at}>
        {new Date(comment?.createdAt).toISOString().split("T")[0]}
      </span>

      {/* Video of Comment Link */}
      <Link className={style.video_link} to={`/videos/${comment.video._id}`}>
        Open its video
      </Link>

      {/* Delete Comment Button */}
      <button
        type="button"
        title="delete this comment"
        className={style.delete_comment_btn}
        onClick={() => deleteComment(comment.video._id, comment._id)}
        disabled={deleteLoading ? true : false}
        style={deleteLoading ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        {deleteLoading ? (
          <PuffLoader color="#000" size={20} />
        ) : (
          <FontAwesomeIcon icon={faTrashCan} />
        )}
      </button>

      {/* Update Comment Button */}
      <button
        type="button"
        className={style.update_comment_btn}
        onClick={() => setOpenUpdateComment(true)}
      >
        Update this comment
      </button>

      {/* Update Comment Component */}
      {openUpdateComment ? (
        <UpdateComment
          comment={comment}
          videoComments={comments}
          setVideoComments={setComments}
          setOpenUpdateComment={setOpenUpdateComment}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentCard;
