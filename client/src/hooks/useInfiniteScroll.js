import { useEffect, useState } from "react";

const useInfiniteScroll = (setPage) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let timeoutId;

    // Delay before attaching scroll event listener
    const delay = 500;

    timeoutId = setTimeout(() => {
      setMounted(true);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - document.body.offsetHeight / 4
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    const debouncedHandleScroll = debounce(handleScroll, 100);

    window.addEventListener("scroll", debouncedHandleScroll);

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, [setPage, mounted]);

  return null;
};

// Debounce function to limit the rate of execution
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default useInfiniteScroll;
