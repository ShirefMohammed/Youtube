import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContainerWithProps = () => {
  const theme = localStorage.getItem("theme");

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      style={{ minWidth: "375px", zIndex: "100000" }}
    />
  );
};

export default ToastContainerWithProps;
