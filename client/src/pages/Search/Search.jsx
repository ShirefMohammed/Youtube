import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { UserCard, VideoCard } from "../../components";
import { useHandleErrors, useInfiniteScroll } from "../../hooks";
import axios from "../../api/axios";
import style from "./Search.module.css";

const Search = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchKey = searchParams.get("searchKey");
  const [prevSearchKey, setPrevSearchKey] = useState(null);

  const limit = 15;
  const [page, setPage] = useState(1);

  const [searchType, setSearchType] = useState("videos");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoad, setSearchLoad] = useState(false);

  const handleErrors = useHandleErrors();
  useInfiniteScroll(setPage);

  // Search videos or users
  const search = async () => {
    try {
      setSearchLoad(true);
      const res = await axios.get(
        `${searchType}/search?searchKey=${searchKey}&page=${page}&limit=${limit}`
      );
      setSearchResults((prev) => [...prev, ...res.data.data]);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchLoad(false);
    }
  };

  // Search while changing searchKey or page or searchType
  useEffect(() => {
    if (searchKey !== null && searchKey !== prevSearchKey) {
      setSearchResults([]);
      setPage(1);
      setPrevSearchKey(searchKey);
    } else if (searchKey !== null) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey, page, searchType]);

  // Fetch initial search results when searchKey is set
  useEffect(() => {
    if (searchKey !== null) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  // Handle change in search type to fetch new results
  const handleSearchTypeChange = (checkedSearchType) => {
    setPage(1);
    setSearchResults([]);
    setSearchType(checkedSearchType);
  };

  return (
    <div className={style.search}>
      {/* Search Filter Controllers */}
      <div className={style.controllers}>
        <div>
          <input
            type="radio"
            id="videos"
            name="searchType"
            value="videos"
            checked={searchType === "videos"}
            onChange={() => handleSearchTypeChange("videos")}
          />
          <label htmlFor="videos">Videos</label>
        </div>
        <div>
          <input
            type="radio"
            id="users"
            name="searchType"
            value="users"
            checked={searchType === "users"}
            onChange={() => handleSearchTypeChange("users")}
          />
          <label htmlFor="users">Users</label>
        </div>
      </div>

      {/* Search Results */}
      {searchLoad && searchResults.length === 0 ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : searchResults.length > 0 ? (
        <div className={style.results_container}>
          {searchType === "videos"
            ? searchResults.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))
            : searchType === "users"
            ? searchResults.map((user) => (
                <UserCard key={user._id} user={user} />
              ))
            : ""}
        </div>
      ) : (
        <p className={style.no_search_results}>No search results found</p>
      )}
    </div>
  );
};

export default Search;
