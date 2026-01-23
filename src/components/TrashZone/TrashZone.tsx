import "./TrashZone.css";
import { forwardRef } from "react";

interface IProps {
  isActive: boolean;
  isArmed: boolean;
}

export const TrashZone = forwardRef<HTMLDivElement, IProps>(
  ({ isActive, isArmed }, ref) => {
    const text = !isActive
      ? "Drag here and keep 2 sec to delete"
      : isArmed
        ? "Release to delete"
        : "Keep holding...";

    return (
      <div
        ref={ref}
        className={`trash ${isActive ? "active" : ""} ${isArmed ? "armed" : ""} no-select`}
      >
        🗑
        <div className="trash-text">{text}</div>
      </div>
    );
  },
);
