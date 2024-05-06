import style from "./NoResourceFound.module.css";

const NoResourceFound = () => {
  return (
    <section className={style.no_resource_found}>
      <div>
        <h2>No Resource Found</h2>
        <p>The resource you look for is not found</p>
      </div>
    </section>
  );
};

export default NoResourceFound;
