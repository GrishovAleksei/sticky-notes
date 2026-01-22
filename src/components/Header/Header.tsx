import "./Header.css";
import { hederHeight } from "../../vars.ts";

interface IProps {
  onClick(): void;
}

export const Header = (props: IProps) => {
  const { onClick } = props;

  return (
    <div
      className={"header-container no-select"}
      style={{ height: hederHeight }}
    >
      <button className={"header-btn"} onClick={onClick}>
        {"Add note +"}
      </button>
    </div>
  );
};
