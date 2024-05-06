import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UsersViewer from "../UsersViewer/UsersViewer";
import { useHandleErrors, useInfiniteScroll } from "../../../../hooks";
import axios from "../../../../api/axios";
import style from "./Subscriptions.module.css";

const Subscriptions = () => {
  const user = useSelector((state) => state.user);

  const usersLimit = 15;
  const [usersPage, setUsersPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(true);

  const removeUserType = "unsubscribe";

  const handleErrors = useHandleErrors();
  useInfiniteScroll(setUsersPage);

  // Fetch subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setFetchUsersLoad(true);
        const res = await axios.get(
          `/users/${user._id}/subscriptions?page=${usersPage}&limit=${usersLimit}`
        );
        setUsers((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUsersLoad(false);
      }
    };

    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  return (
    <div className={`${style.subscriptions}`}>
      <UsersViewer
        users={users}
        setUsers={setUsers}
        fetchUsersLoad={fetchUsersLoad}
        removeUserType={removeUserType}
      />
    </div>
  );
};

export default Subscriptions;
