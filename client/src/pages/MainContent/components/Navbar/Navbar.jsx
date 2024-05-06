import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./Navbar.module.css";

const Navbar = () => {
  const user = useSelector((state) => state.user);

  const navigate = useNavigate();

  const [searchKey, setSearchKey] = useState("");

  const search = (e) => {
    e.preventDefault();

    if (searchKey !== "") {
      navigate(`/search?searchKey=${searchKey}`);
    }
  };

  return (
    <header className={style.navbar}>
      <form className={style.search} onSubmit={search}>
        <input
          type="search"
          name="searchKey"
          id="searchKey"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search"
        />

        <button type="submit" title="Search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </form>

      <nav className={style.links}>
        <Link to="/createVideo" title="create video">
          <FontAwesomeIcon icon={faPlus} />
        </Link>

        {user?.accessToken ? (
          <Link to={`/users/${user?._id}`} title="my profile">
            <img
              src={user.avatarUrl || defaultAvatar}
              className={style.avatarUrl}
              alt=""
            />
          </Link>
        ) : (
          <Link to="/authentication" title="login">
            <FontAwesomeIcon icon={faSignInAlt} />
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
