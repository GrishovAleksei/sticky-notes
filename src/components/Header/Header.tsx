import "./Header.css";

interface IProps {
  onClick(): void;
}

export const Header = (props: IProps) => {
  const { onClick } = props;

  return (
    <div className={"header-container"}>
      <button className={"header-btn"} onClick={onClick}>
        {"Add note +"}
      </button>
    </div>
  );
};
