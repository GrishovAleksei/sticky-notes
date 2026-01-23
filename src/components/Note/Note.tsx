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

  const startResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = note.w;
    const startH = note.h;

    const onMove = (ev: MouseEvent) => {
      const newW = Math.max(80, startW + (ev.clientX - startX));
      const newH = Math.max(80, startH + (ev.clientY - startY));
      onUpdate({ ...note, w: newW, h: newH });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

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
        <div
          className="resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            startResize(e);
          }}
        />
      </div>
    </div>
  );
};
