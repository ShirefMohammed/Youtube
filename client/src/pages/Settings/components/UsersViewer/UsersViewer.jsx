/* eslint-disable react/prop-types */
import { MoonLoader } from "react-spinners";
import UserCard from "../UserCard/UserCard";
import style from "./UsersViewer.module.css";

const UsersViewer = ({ users, setUsers, fetchUsersLoad, removeUserType }) => {
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
              key={userData?._id}
              userData={userData}
              removeUserType={removeUserType}
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

export default UsersViewer;
