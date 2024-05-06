const useApplyTheme = () => {
  let localStorageTheme = localStorage.getItem("theme");

  const applyTheme = (theme = localStorageTheme) => {
    if (theme !== "light" && theme !== "dark") {
      localStorage.setItem("theme", "dark");
      theme = "dark";
    }

    if (theme === "light") {
      document.documentElement.style.setProperty("--bg", "#ffffff");
      document.documentElement.style.setProperty("--bgLighter", "#f5f5f5");
      document.documentElement.style.setProperty("--text", "#333333");
      document.documentElement.style.setProperty("--textSoft", "#777777");
      document.documentElement.style.setProperty("--soft", "#f8f8f8");
    } else {
      document.documentElement.style.setProperty("--bg", "#181818");
      document.documentElement.style.setProperty("--bgLighter", "#202020");
      document.documentElement.style.setProperty("--text", "white");
      document.documentElement.style.setProperty("--textSoft", "#aaaaaa");
      document.documentElement.style.setProperty("--soft", "#373737");
    }
  };

  return applyTheme;
};

export default useApplyTheme;
