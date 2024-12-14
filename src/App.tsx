import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import PianoKeys from "./components/PianoKeys";
import Generator from "./components/Generator/Generator";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [ports, setPorts] = useState([]);
  const [currentPort, setCurrentPort] = useState(0);
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

  async function changePort(index) {
    await invoke("midi_set_port", { index: parseInt(index) });
    setCurrentPort(index);
  }

  async function handlePortChange(e) {
    await changePort(parseInt(e.currentTarget.value));
  }

  async function handlePlayNote() {
    await invoke("midi_play_note", { note: 54 });
  }

  useEffect(() => {
    console.log("Getting MIDI ports");
    getPorts();
  }, []);

  useEffect(() => {
    console.log("Setting virtual port as default");
    if (ports.length < 0) return;
    const virtualPort = ports.findIndex(
      (name) => name == "LoopBe Internal MIDI"
    );
    if (virtualPort < 0) return;
    changePort(virtualPort);
    setCurrentPort(virtualPort);
  }, [ports]);

  return (
    <main className="container">
      <h1>Virtual MIDI Controller</h1>
      <button onClick={getPorts}>Refresh Ports</button>
      <button onClick={connectPort}>Connect to Port</button>
      <button onClick={handlePlayNote}>Play debug note</button>
      <select value={currentPort} onChange={handlePortChange}>
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
