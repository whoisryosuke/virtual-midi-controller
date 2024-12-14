import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import PianoKeys from "./components/PianoKeys";
import Generator from "./components/Generator/Generator";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [ports, setPorts] = useState([]);
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet"));
  }

  async function connectPort() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke("midi_connect_to_port");
  }

  async function getPorts() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    const newPorts = await invoke("midi_get_ports");
    console.log("got ports", newPorts);
    //@ts-ignore
    setPorts(newPorts);
  }

  async function handlePortChange(e) {
    await invoke("midi_set_port", { index: parseInt(e.currentTarget.value) });
  }

  async function handlePlayNote() {
    await invoke("midi_play_note", { note: 54 });
  }

  return (
    <main className="container">
      <h1>Virtual MIDI Controller</h1>
      <button onClick={getPorts}>Get Ports</button>
      <button onClick={connectPort}>Connect to Port</button>
      <button onClick={handlePlayNote}>Play note</button>
      <select onChange={handlePortChange}>
        {ports.map((name, index) => (
          <option value={index}>{name}</option>
        ))}
      </select>
      <PianoKeys />
      <Generator />
    </main>
  );
}

export default App;
