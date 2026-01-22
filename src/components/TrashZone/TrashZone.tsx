import "./TrashZone.css";
import { forwardRef } from "react";

interface IProps {
  isActive: boolean;
}

export const TrashZone = forwardRef<HTMLDivElement, IProps>(
  ({ isActive }, ref) => {
    return (
      <div ref={ref} className={`trash ${isActive ? "active" : ""} no-select`}>
        🗑
        <div className="trash-text">
          {isActive ? "Release to delete" : "Drop here to delete"}
        </div>
      </div>
    );
  },
);
