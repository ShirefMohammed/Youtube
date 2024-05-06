import style from "./NoServerResponse.module.css";

const NoServerResponse = () => {
  return (
    <section className={style.no_server_response}>
      <div>
        <h2>No Server Response</h2>
        <p>There is no server response, try after while</p>
      </div>
    </section>
  );
};

export default NoServerResponse;
