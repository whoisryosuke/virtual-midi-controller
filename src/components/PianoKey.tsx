import { invoke } from "@tauri-apps/api/core";
import React from "react";

const PIANO_KEY_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

type Props = {
  octave: number;
  note: number;
};

const PianoKey = ({ note, octave }: Props) => {
  const midi_key = note + 12 * octave;
  async function handlePressed() {
    await invoke("midi_play_note_press", { note: midi_key });
  }
  async function handleReleased() {
    await invoke("midi_play_note_release", { note: midi_key });
  }
  return (
    <div
      className="piano-key"
      onMouseEnter={handlePressed}
      onMouseLeave={handleReleased}
    >
      {PIANO_KEY_NOTES[note]}
    </div>
  );
};

export default PianoKey;
