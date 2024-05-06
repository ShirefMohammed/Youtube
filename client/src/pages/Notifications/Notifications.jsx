/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClapperboard } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors } from "../../hooks";
import { setNotifications } from "../../store/slices/notificationsSlice";
import NOTIFICATIONS_LIST from "../../utils/notifications_types_list";
import defaultAvatar from "../../assets/defaultAvatar.png";
import style from "./Notifications.module.css";

const Notifications = () => {
  const notifications = useSelector((state) => state.notifications);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();

  // Set all unread notifications to be read
  useEffect(() => {
    if (notifications.some((notification) => notification.isRead === false)) {
      updateNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // Set all unread notifications to be read
  const updateNotifications = async () => {
    const updatedNotifications = notifications.map((notification) => {
      if (!notification.isRead) {
        setNotificationAsRead(notification);
        return { ...notification, isRead: true };
      } else {
        return notification;
      }
    });

    dispatch(setNotifications(updatedNotifications));
  };

  // Set notification as read
  const setNotificationAsRead = async (notification) => {
    try {
      await axiosPrivate.patch(
        `users/${notification.receiver._id}/notifications/${notification._id}`,
        { isRead: true }
      );
    } catch (err) {
      handleErrors(err);
    }
  };

  return (
    <div className={style.notifications}>
      <h2>My Notifications</h2>

      {notifications.length > 0 ? (
        <ul className={style.notifications_list}>
          {notifications.map((notification) => (
            <li key={notification._id}>
              {notification.type === NOTIFICATIONS_LIST.NEW_SUBSCRIBER ? (
                <NewSubscriberNotificationCard notification={notification} />
              ) : notification.type === NOTIFICATIONS_LIST.NEW_COMMENT ? (
                <NewCommentNotificationCard notification={notification} />
              ) : (
                ""
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className={style.no_notifications}>
          You don not receive any notifications yet.
        </div>
      )}
    </div>
  );
};

const NewSubscriberNotificationCard = ({ notification }) => {
  return (
    <div className={style.new_subscriber_notification_card}>
      <div className={style.notification_desc}>
        <img
          src={notification.sender.avatarUrl || defaultAvatar}
          alt=""
          loading="lazy"
        />
        <p>
          <Link to={`/users/${notification.sender._id}`}>
            {notification.sender.name}
          </Link>{" "}
          subscribed your channel
        </p>
      </div>

      <div className={style.createdAt}>
        {formatVideoDate(notification.createdAt)}
      </div>
    </div>
  );
};

const NewCommentNotificationCard = ({ notification }) => {
  const [viewMoreContent, setViewMoreContent] = useState(false);

  return (
    <div className={style.new_comment_notification_card}>
      <div className={style.notification_desc}>
        <img
          src={notification.sender.avatarUrl || defaultAvatar}
          alt=""
          loading="lazy"
        />
        <p>
          <Link to={`/users/${notification.sender._id}`}>
            {notification.sender.name}
          </Link>{" "}
          added new comment on your video
        </p>
      </div>

      <Link to={`/videos/${notification.comment.video}`}>
        <FontAwesomeIcon icon={faClapperboard} />
        Open video page
      </Link>

      <div className={style.comment_content}>
        <span>He commented:</span>
        {notification.comment.content.length > 100 ? (
          <pre>
            {viewMoreContent
              ? notification.comment.content
              : notification.comment.content.substring(0, 101)}
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
          <pre>{notification.comment.content}</pre>
        )}
      </div>

      <div className={style.createdAt}>
        {formatVideoDate(notification.createdAt)}
      </div>
    </div>
  );
};

const formatVideoDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export default Notifications;
