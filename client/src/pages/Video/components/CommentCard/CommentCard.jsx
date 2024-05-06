/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import UpdateComment from "../UpdateComment/UpdateComment";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import ROLES_LIST from "../../../../utils/roles_list";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./CommentCard.module.css";

const CommentCard = ({ comment, videoComments, setVideoComments }) => {
  const user = useSelector((state) => state.user);

  const [viewMoreContent, setViewMoreContent] = useState(false);
  const [deleteCommentLoad, setDeleteCommentLoad] = useState(false);
  const [openUpdateComment, setOpenUpdateComment] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

  const deleteComment = async (commentId) => {
    try {
      setDeleteCommentLoad(true);
      await axiosPrivate.delete(
        `videos/${comment.video._id}/comments/${commentId}`
      );
      setVideoComments(
        videoComments.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteCommentLoad(false);
    }
  };

  return (
    <div className={style.comment_card}>
      <div className={style.top}>
        {/* Comment Creator */}
        <Link to={`/users/${comment.creator._id}`} className={style.user_info}>
          <img src={comment.creator.avatarUrl || defaultAvatar} alt="" />
          <span>{comment.creator.name}</span>
        </Link>

        {/* Comment Actions */}
        <ul className={style.comment_actions}>
          {/* delete comment button */}
          {user?.accessToken &&
          (user._id === comment.creator._id ||
            user._id === comment.video.creator ||
            user.roles.includes(ROLES_LIST.Admin)) ? (
            <li>
              <button
                type="button"
                title="delete this comment"
                disabled={deleteCommentLoad ? true : false}
                style={deleteCommentLoad ? { cursor: "revert" } : {}}
                onClick={() => deleteComment(comment._id)}
              >
                {deleteCommentLoad ? (
                  <PuffLoader color="#000" size={15} />
                ) : (
                  <FontAwesomeIcon icon={faTrashCan} />
                )}
              </button>
            </li>
          ) : (
            ""
          )}

          {/* update comment button */}
          {user?.accessToken && user._id === comment.creator._id ? (
            <li>
              <button
                type="button"
                title="update this comment"
                onClick={() => setOpenUpdateComment(true)}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
            </li>
          ) : (
            ""
          )}
        </ul>
      </div>

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

      {/* Update Comment */}
      {openUpdateComment ? (
        <UpdateComment
          comment={comment}
          videoComments={videoComments}
          setVideoComments={setVideoComments}
          setOpenUpdateComment={setOpenUpdateComment}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentCard;
