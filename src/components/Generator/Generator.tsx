import React, { useEffect, useState } from "react";
import { PIANO_KEY_NOTES } from "../../helpers/piano";
import teoria from "teoria";
import { invoke } from "@tauri-apps/api/core";

interface TeoriaNote {
  octave: () => number;
  name: () => string;
  /**
   * Returns the name of the note, with an optional display of octave number
   */
  toString: () => string;
  /**
   * Returns the scientific notation form of the note (fx E4, Bb3, C#7 etc.)
   */
  scientific: () => string;
  key: () => number;
  /**
   * Returns a number ranging from 0-127 representing a MIDI note value
   */
  midi: () => number;
  /**
   * Returns the duration of the note (including dots)
   * in seconds. The first argument is the tempo in beats
   * per minute, the second is the beat unit (i.e. the
   * lower numeral in a time signature).
   */
  durationInSeconds: () => number;
}

type GeneratorTypes = "scale" | "chord";
type TeoriaScales = "mixolydian" | "aeolian" | "ionian" | "dorian";
type GeneratorConfig = {
  type: GeneratorTypes;
  scale: TeoriaScales;
};
type Props = {};

const Generator = (props: Props) => {
  const [rootNote, setRootNote] = useState("C");
  const [octave, setOctave] = useState(4);
  const [config, setConfig] = useState<GeneratorConfig>({
    type: "scale",
    scale: "mixolydian",
  });
  const [notes, setNotes] = useState<TeoriaNote[]>([]);

  const handleRootNoteChange = (e) => {
    setRootNote(e.currentTarget.value);
  };

  const handleOctaveChange = (e) => {
    setOctave(e.currentTarget.value);
  };

  const handleTypeChange = (e) => {
    setConfig((prevConfig) => ({ ...prevConfig, type: e.target.value }));
  };

  const handleScaleChange = (e) => {
    console.log("scale change", e);
    setConfig((prevConfig) => ({
      ...prevConfig,
      scale: e.target.value,
    }));
  };

  function wait() {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  const handlePlayNotes = async () => {
    // await Promise.all([
    //   invoke("midi_play_note", { note: 54 }),
    //   wait(),
    //   invoke("midi_play_note", { note: 56 }),
    // ]);
    const noteMidiKeys = notes.map((note) => note.midi());
    await invoke("midi_play_notes", { notes: noteMidiKeys });
  };

  useEffect(() => {
    // Create note
    const fixedNote = rootNote.replace("#", "b");
    const note = teoria.note(`${fixedNote}${octave}`);
    let newNotes = [];
    switch (config.type) {
      case "scale":
        newNotes = note.scale(config.scale).notes();
        break;
      case "chord":
        newNotes = note.chord("sus2").notes();
        break;
    }
    console.log("new notes", newNotes);
    setNotes(newNotes);
  }, [rootNote, octave]);

  return (
    <div>
      <h1>Music Theory Generator</h1>
      <div style={{ display: "flex" }}>
        <select value={rootNote} onChange={handleRootNoteChange}>
          {PIANO_KEY_NOTES.map((pianoKey) => (
            <option value={pianoKey}>{pianoKey}</option>
          ))}
        </select>
        <select value={octave} onChange={handleOctaveChange}>
          {[...new Array(9)].map((_, index) => (
            <option value={index}>{index}</option>
          ))}
        </select>
        <div>
          <select value={config.type} onChange={handleTypeChange}>
            <option value={"scale"}>{"Scale"}</option>
            <option value={"chord"}>{"Chord"}</option>
          </select>
          {config.type == "scale" && (
            <select value={config.scale} onChange={handleScaleChange}>
              <option value={"mixolydian"}>{"Mixolydian"}</option>
              <option value={"aeolian"}>{"Aeolian"}</option>
              <option value={"ionian"}>{"Ionian"}</option>
              <option value={"dorian"}>{"Dorian"}</option>
            </select>
          )}
        </div>
      </div>
      <div>
        <h2>Notes</h2>
        <div style={{ display: "flex" }}>
          {notes.map((note) => (
            <span style={{ marginRight: "1rem" }}>
              <strong>
                {note.name().toLocaleUpperCase()}
                {note.octave()}
              </strong>
              : <small>{note.midi()}</small>
            </span>
          ))}
        </div>
        <button onClick={handlePlayNotes}>Play Notes</button>
      </div>
    </div>
  );
};

export default Generator;
