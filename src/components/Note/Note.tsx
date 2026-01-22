import type { INote } from "../../types.ts";
import React, { useRef } from "react";
import "./Note.css";

interface IProps {
  note: INote;
  onUpdate(note: Partial<INote>): void;
  onMouseDown(e: React.MouseEvent): void;
}

export const Note = (props: IProps) => {
  const { note, onMouseDown, onUpdate } = props;
  const noteRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={noteRef}
      className={"note"}
      style={{
        left: note.x,
        top: note.y,
        width: note.w,
        height: note.h,
        backgroundColor: note.color,
        zIndex: note.z,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="note-content">
        <div className="note-text">{note.text || "Click to edit..."}</div>
      </div>
    </div>
  );
};
