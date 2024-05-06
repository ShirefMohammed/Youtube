import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UsersViewer from "../UsersViewer/UsersViewer";
import { useHandleErrors, useInfiniteScroll } from "../../../../hooks";
import axios from "../../../../api/axios";
import style from "./Subscribers.module.css";

const Subscribers = () => {
  const user = useSelector((state) => state.user);

  const usersLimit = 15;
  const [usersPage, setUsersPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(true);

  const removeUserType = "removeSubscriber";

  const handleErrors = useHandleErrors();
  useInfiniteScroll(setUsersPage);

  // Fetch subscribers
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setFetchUsersLoad(true);
        const res = await axios.get(
          `/users/${user._id}/subscribers?page=${usersPage}&limit=${usersLimit}`
        );
        setUsers((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUsersLoad(false);
      }
    };

    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  return (
    <div className={`${style.subscribers}`}>
      <UsersViewer
        users={users}
        setUsers={setUsers}
        fetchUsersLoad={fetchUsersLoad}
        removeUserType={removeUserType}
      />
    </div>
  );
};

export default Subscribers;
