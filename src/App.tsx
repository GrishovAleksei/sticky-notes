import React, { useCallback, useRef, useState } from "react";
import { Header } from "./components/Header/Header.tsx";
import { type INote, ModeType } from "./types.ts";
import { Note } from "./components/Note/Note.tsx";
import { hederHeight, noteSize } from "./vars.ts";
import { TrashZone } from "./components/TrashZone/TrashZone.tsx";
import "./App.css";

const MODE_CLASS: Record<ModeType, string> = {
  [ModeType.IDLE]: "idle",
  [ModeType.ADDING]: "adding",
  [ModeType.DRAGGING]: "dragging",
  [ModeType.OVER_TRASH]: "over-trash",
};

function App() {
  const [notes, setNotes] = useState<INote[]>([]);
  const [mode, setMode] = useState<ModeType>(ModeType.IDLE);
  const [maxZIndex, setMaxZIndex] = useState<number>(1);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);

  const activateAddingMode = useCallback(() => {
    setMode(ModeType.ADDING);
  }, []);

  const onClickCanvas = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      switch (mode) {
        case ModeType.ADDING: {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const newNote: INote = {
            id: Date.now().toString(),
            x,
            y,
            w: noteSize,
            h: noteSize,
            z: maxZIndex + 1,
            text: "",
          };
          setNotes((prev) => [...prev, newNote]);
          setMode(ModeType.IDLE);
          setMaxZIndex((z) => z + 1);
        }
      }
    },
    [maxZIndex, mode],
  );

  const updateNote = useCallback((updNote: Partial<INote>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === updNote.id ? { ...note, ...updNote } : note,
      ),
    );
  }, []);

  const setActiveNote = useCallback(
    (id: string) => {
      setActiveNoteId(id);

      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, z: maxZIndex } : note)),
      );
      setMaxZIndex((prev) => prev + 1);
    },
    [maxZIndex],
  );

  const handleDrag = useCallback(
    (id: string, x: number, y: number) => {
      updateNote({ id, x, y });

      if (trashZoneRef.current) {
        const trashRect = trashZoneRef.current.getBoundingClientRect();
        const note = notes.find((n) => n.id === id);
        if (!note) return;
      }
    },
    [notes, updateNote],
  );

  const onClickNote = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      setActiveNote(id);
      const element = e.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top + hederHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        console.log("handleMouseMove");
        const newX = moveEvent.clientX - offsetX;
        const newY = moveEvent.clientY - offsetY;
        handleDrag(id, newX, newY);
      };

      const handleMouseUp = () => {
        setActiveNoteId(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleDrag, setActiveNote],
  );

  return (
    <div className={"app"}>
      <Header onClick={activateAddingMode} />
      <div
        className={`canvas canvas-${MODE_CLASS[mode]}`}
        onClick={onClickCanvas}
      >
        {notes.map((note: INote) => (
          <Note
            key={note.id}
            note={note}
            onMouseDown={(e) => onClickNote(e, note.id)}
            onUpdate={updateNote}
          />
        ))}
        <TrashZone isActive={false} />
      </div>
    </div>
  );
}

export default App;
