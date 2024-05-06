import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import UserCard from "../UserCard/UserCard";
import {
  useAxiosPrivate,
  useHandleErrors,
  useInfiniteScroll,
} from "../../../../hooks";
import style from "./Users.module.css";

const Users = () => {
  const limit = 15;
  const [usersPage, setUsersPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [fetchUsersLoad, setFetchUsersLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  useInfiniteScroll(setUsersPage);

  // Fetch users to admin
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchUsersLoad(true);
        const res = await axiosPrivate.get(
          `/users?page=${usersPage}&limit=${limit}`
        );
        setUsers((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUsersLoad(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  return (
    <div className={`${style.users_viewer}`}>
      {fetchUsersLoad && users.length === 0 ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : users.length > 0 ? (
        <div className={style.users}>
          {users.map((userData) => (
            <UserCard
              key={userData._id}
              userData={userData}
              users={users}
              setUsers={setUsers}
            />
          ))}
        </div>
      ) : (
        <p className={style.no_users}>No Users Here</p>
      )}
    </div>
  );
};

export default Users;
