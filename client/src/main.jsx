import ReactDOM from "react-dom/client";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import App from "./App.jsx";
import "./index.css";

import { Provider } from "react-redux";
import { store } from "./store/store.js";

// Disable React Dev Tools in Production
if (import.meta.env.VITE_NODE_ENV === "production") {
  disableReactDevTools();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
