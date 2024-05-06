/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import CommentCard from "../CommentCard/CommentCard";
import {
  useAxiosPrivate,
  useHandleErrors,
  useInfiniteScroll,
  useNotify,
} from "../../../../hooks";
import axios from "../../../../api/axios";
import style from "./Comments.module.css";

const Comments = ({ videoId, socket }) => {
  const user = useSelector((state) => state.user);

  const limit = 5;
  const [commentsPage, setCommentsPage] = useState(1);
  const [videoComments, setVideoComments] = useState([]);

  const [newComment, setNewComment] = useState("");
  const [sendCommentLoad, setSendCommentLoad] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();
  useInfiniteScroll(setCommentsPage);

  // Fetch video comments
  useEffect(() => {
    const fetchVideoComments = async () => {
      try {
        const res = await axios.get(
          `/videos/${videoId}/comments?page=${commentsPage}&limit=${limit}`
        );
        setVideoComments((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      }
    };

    fetchVideoComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsPage]);

  const sendComment = async (e) => {
    e.preventDefault();

    try {
      setSendCommentLoad(true);

      if (!newComment) return notify("info", "Enter comment content");

      const res = await axiosPrivate.post(`videos/${videoId}/comments`, {
        content: newComment,
      });

      setVideoComments((prev) => [res.data.data.comment, ...prev]);

      setNewComment("");

      socket.emit("sendNotification", res.data.data.notification);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSendCommentLoad(false);
    }
  };

  return (
    <div className={style.comments}>
      {/* Title */}
      <span className={style.title}>Comments</span>

      {/* Send Comment Form */}
      {user?.accessToken ? (
        <form className={style.send_comment}>
          <textarea
            name="comment"
            id="comment"
            placeholder="Add a comment"
            onChange={(e) => setNewComment(e.target.value)}
            value={newComment}
          ></textarea>

          <button
            type="submit"
            title="send comment"
            className={style.submit_btn}
            disabled={sendCommentLoad ? true : false}
            style={sendCommentLoad ? { cursor: "revert" } : {}}
            onClick={sendComment}
          >
            {sendCommentLoad ? (
              <PuffLoader color="#000" size={22} />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </form>
      ) : (
        ""
      )}

      {/* Comments Container */}
      <div className={style.comments_container}>
        {user?.accessToken && videoComments.length === 0 ? (
          <p className={style.no_comments_added}>
            No comments added, you can add the first comment
          </p>
        ) : videoComments.length > 0 ? (
          videoComments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              videoComments={videoComments}
              setVideoComments={setVideoComments}
            />
          ))
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Comments;
