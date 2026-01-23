import React, { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./components/Header/Header.tsx";
import { type INote, ModeType } from "./types.ts";
import { Note } from "./components/Note/Note.tsx";
import { hederHeight, holdToRelease, noteSize } from "./utils/vars.ts";
import { TrashZone } from "./components/TrashZone/TrashZone.tsx";
import "./App.css";
import "./styles/tokens.css";
import { loadNotes, saveNotes } from "./Services/LocalStorage.ts";
import { mockApi } from "./Services/api.ts";
import { clamp } from "./utils";

const MODE_CLASS: Record<ModeType, string> = {
  [ModeType.IDLE]: "idle",
  [ModeType.ADDING]: "adding",
  [ModeType.DRAGGING]: "dragging",
  [ModeType.OVER_TRASH]: "over-trash",
};

// TODO: 1) rm hederHeight from the dragging logic
// TODO: 2) text selecting while resizing
function App() {
  const [notes, setNotes] = useState<INote[]>([]);
  const [mode, setMode] = useState<ModeType>(ModeType.IDLE);
  const [maxZIndex, setMaxZIndex] = useState<number>(1);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [overTrashId, setOverTrashId] = useState<string | null>(null);
  const trashEnterTimerRef = useRef<number | null>(null);
  const trashArmedRef = useRef(false);
  const [isTrashArmed, setIsTrashArmed] = useState(false);

  const deletingIdRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);

  const setArmed = (v: boolean) => {
    trashArmedRef.current = v;
    setIsTrashArmed(v);
  };

  const clearTrashTimer = useCallback(() => {
    // console.log("[clearTrashTimer]: stop");
    if (trashEnterTimerRef.current) {
      window.clearTimeout(trashEnterTimerRef.current);
      trashEnterTimerRef.current = null;
    }
    setArmed(false);
  }, []);

  const startTrashTimer = useCallback((id: string) => {
    // console.log("[clearTrashTimer]: start");
    if (trashEnterTimerRef.current) return;
    // console.log("[clearTrashTimer]: start FIRST");
    trashEnterTimerRef.current = window.setTimeout(() => {
      trashEnterTimerRef.current = null;
      if (deletingIdRef.current === id) {
        setArmed(true);
        setMode(ModeType.OVER_TRASH);
      }
    }, holdToRelease);
  }, []);

  // Load
  useEffect(() => {
    const savedNotes = loadNotes();
    if (savedNotes.length > 0) {
      setNotes(savedNotes);
      const maxZ = Math.max(...savedNotes.map((note) => note.z), 1);
      setMaxZIndex(maxZ + 1);
    }
  }, []);

  // Save
  useEffect(() => {
    // Todo: delay?
    if (notes.length > 0) {
      saveNotes(notes);
      mockApi.saveNotes(notes).catch((err) => {
        console.error("Failed to save to API:", err);
      });
    }
  }, [notes]);

  const activateAddingMode = useCallback(() => {
    setMode(ModeType.ADDING);
  }, []);

  const resetStates = useCallback(() => {
    clearTrashTimer();
    setActiveNoteId(null);
    setOverTrashId(null);
    deletingIdRef.current = null;
    setMode(ModeType.IDLE);
  }, [clearTrashTimer]);

  const deleteNote = useCallback(
    (id: string) => {
      const newNotes = notes.filter((note) => note.id !== id);
      setNotes(newNotes);
    },
    [notes],
  );

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

        const noteRect = {
          left: x,
          right: x + note.w,
          top: y,
          bottom: y + note.h + hederHeight,
        };

        const isOverlapping = !(
          noteRect.right < trashRect.left ||
          noteRect.left > trashRect.right ||
          noteRect.bottom < trashRect.top ||
          noteRect.top > trashRect.bottom
        );

        const _id = isOverlapping ? id : null;
        if (isOverlapping) {
          // first time
          if (!deletingIdRef.current) startTrashTimer(id);
        } else {
          // moved away
          if (deletingIdRef.current) clearTrashTimer();
        }
        deletingIdRef.current = _id;
        setOverTrashId(_id);
      }
    },
    [clearTrashTimer, notes, startTrashTimer, updateNote],
  );

  const onClickNote = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      setActiveNote(id);
      const element = e.currentTarget as HTMLElement;
      const noteRect = element.getBoundingClientRect();
      const canvas = canvasRef.current?.getBoundingClientRect();
      const maxX = (canvas?.width ?? 0) - noteRect.width;
      const maxY = (canvas?.height ?? 0) - noteRect.height - hederHeight;
      const offsetX = e.clientX - noteRect.left;
      const offsetY = e.clientY - noteRect.top + hederHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        setMode(ModeType.DRAGGING);
        const newX = moveEvent.clientX - offsetX;
        const newY = moveEvent.clientY - offsetY;
        handleDrag(id, clamp(newX, 0, maxX), clamp(newY, 0, maxY));
      };

      const handleMouseUp = () => {
        if (deletingIdRef.current && trashArmedRef.current) {
          deleteNote(deletingIdRef.current);
        }
        resetStates();
        saveNotes(notes);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [deleteNote, handleDrag, notes, resetStates, setActiveNote],
  );

  return (
    <div className={"app"}>
      <Header onClick={activateAddingMode} />
      <div
        ref={canvasRef}
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
        <TrashZone
          ref={trashZoneRef}
          isActive={!!overTrashId}
          isArmed={isTrashArmed}
        />
      </div>
    </div>
  );
}

export default App;
