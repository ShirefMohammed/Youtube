import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import CommentCard from "../CommentCard/CommentCard";
import {
  useAxiosPrivate,
  useHandleErrors,
  useInfiniteScroll,
} from "../../../../hooks";
import style from "./CreatedComments.module.css";

const CreatedComments = () => {
  const user = useSelector((state) => state.user);

  const commentsLimit = 15;
  const [commentsPage, setCommentsPage] = useState(1);

  const [comments, setComments] = useState([]);
  const [fetchCommentsLoad, setFetchCommentsLoad] = useState(true);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  useInfiniteScroll(setCommentsPage);

  // Fetch created comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setFetchCommentsLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user._id}/createdComments?page=${commentsPage}&limit=${commentsLimit}`
        );
        setComments((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchCommentsLoad(false);
      }
    };

    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsPage]);

  return (
    <div className={`${style.created_comments}`}>
      {fetchCommentsLoad && comments.length === 0 ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : comments.length > 0 ? (
        <div className={style.comments}>
          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              comments={comments}
              setComments={setComments}
            />
          ))}
        </div>
      ) : (
        <p className={style.no_comments}>No Comments Here</p>
      )}
    </div>
  );
};

export default CreatedComments;
