import type { INote } from "../../types.ts";
import React, { useEffect, useRef, useState } from "react";
import "./Note.css";

interface IProps {
  note: INote;
  onUpdate(note: Partial<INote>): void;
  onMouseDown(e: React.MouseEvent): void;
}

export const Note = (props: IProps) => {
  const { note, onMouseDown, onUpdate } = props;
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [isEditing]);

  const onChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...note, text: e.target.value });
  };

  const onBlur = () => {
    setIsEditing(false);
  };

  const onTextClick = () => {
    setIsEditing(true);
  };

  return (
    <div
      className={`note ${isEditing ? "force-hover" : ""}`}
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
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="note-textarea"
            value={note.text}
            onChange={onChangeText}
            onBlur={onBlur}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Type your note..."
          />
        ) : (
          <div className="note-text" onClick={onTextClick}>
            {note.text || "Click to edit..."}
          </div>
        )}
      </div>
    </div>
  );
};
