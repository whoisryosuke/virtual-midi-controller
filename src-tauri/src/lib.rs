use std::{sync::Mutex, thread::sleep, time::Duration};

use midir::{MidiOutput, MidiOutputConnection, MidiOutputPort, MidiOutputPorts};
use tauri::{Builder, Manager, State};
struct AppData {
  midi_channel: MidiOutput,
  midi_ports: MidiOutputPorts,
  current_port: Option<MidiOutputPort>,
  connection: Option<MidiOutputConnection>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn midi_connect_to_port(state: State<'_, Mutex<AppData>>) {
    println!("[MIDI] Connecting to MIDI port");
    let midi_out = MidiOutput::new("My Test Output").unwrap();
    let mut state = state.lock().unwrap();
    println!("\nOpening connection");
    let current_port = state.current_port.clone();
    let conn_out = midi_out.connect(current_port.as_ref().unwrap(), "midir-test");
    let connection = conn_out.unwrap();
    state.connection = Some(connection);
    println!("Connection open. Listen!");
}

#[tauri::command]
fn midi_play_note(state: State<'_, Mutex<AppData>>, note: u8) {
    println!("[MIDI] Playing note");
    let mut state = state.lock().unwrap();
    let check_connection = state.connection.as_mut();

    match check_connection {
        Some(connection) => {
            // Define a new scope in which the closure `play_note` borrows conn_out, so it can be called easily
            let mut play_note = |note: u8, duration: u64| {
                const NOTE_ON_MSG: u8 = 0x90;
                const NOTE_OFF_MSG: u8 = 0x80;
                const VELOCITY: u8 = 0x64;
                // We're ignoring errors in here
                let _ = connection.send(&[NOTE_ON_MSG, note, VELOCITY]);
                sleep(Duration::from_millis(duration * 150));
                let _ = connection.send(&[NOTE_OFF_MSG, note, VELOCITY]);
            };

            play_note(note, 4);
        },
        None => println!("[MIDI] Error! Need to select a port first!"),
    }
}

#[tauri::command]
fn midi_play_notes(state: State<'_, Mutex<AppData>>, notes: Vec<u8>) {
    println!("[MIDI] Playing note");
    let mut state = state.lock().unwrap();
    let check_connection = state.connection.as_mut();

    match check_connection {
        Some(connection) => {
            // Define a new scope in which the closure `play_note` borrows conn_out, so it can be called easily
            let mut play_note = |note: u8, duration: u64| {
                const NOTE_ON_MSG: u8 = 0x90;
                const NOTE_OFF_MSG: u8 = 0x80;
                const VELOCITY: u8 = 0x64;
                // We're ignoring errors in here
                let _ = connection.send(&[NOTE_ON_MSG, note, VELOCITY]);
                sleep(Duration::from_millis(duration * 150));
                let _ = connection.send(&[NOTE_OFF_MSG, note, VELOCITY]);
            };

            let note_duration = 4;
            for i in 0..notes.len() {
                let note = notes[i];
                play_note(note, note_duration);
                sleep(Duration::from_millis(note_duration * 150));
            }

        },
        None => println!("[MIDI] Error! Need to select a port first!"),
    }
}

#[tauri::command]
fn midi_play_note_press(state: State<'_, Mutex<AppData>>, note: u8) {
    println!("[MIDI] Pressing note");
    let mut state = state.lock().unwrap();
    let check_connection = state.connection.as_mut();

    match check_connection {
        Some(connection) => {

    const NOTE_ON_MSG: u8 = 0x90;
    const VELOCITY: u8 = 0x64;
    // We're ignoring errors in here
    let _ = connection.send(&[NOTE_ON_MSG, note, VELOCITY]);
        },
        None => println!("[MIDI] Error! Need to select a port first!"),
    }

}

#[tauri::command]
fn midi_play_note_release(state: State<'_, Mutex<AppData>>, note: u8) {
    println!("[MIDI] Releasing note");
    let mut state = state.lock().unwrap();
    let check_connection = state.connection.as_mut();

    match check_connection {
        Some(connection) => {
            const NOTE_OFF_MSG: u8 = 0x80;
            const VELOCITY: u8 = 0x64;
            // We're ignoring errors in here
            let _ = connection.send(&[NOTE_OFF_MSG, note, VELOCITY]);
        },
        None => println!("[MIDI] Error! Need to select a port first!"),
    }

}

#[tauri::command]
fn midi_get_ports(state: State<'_, Mutex<AppData>>) -> Vec<String> {
    println!("[MIDI] Getting port for UI");
    let state = state.lock().unwrap();
    let ports = state.midi_ports.clone();
    let port_names = ports.iter().map(|port| state.midi_channel.port_name(port).unwrap()).collect::<Vec<_>>();

    // tauri::ipc::Response::new(port_names)
    port_names
}

#[tauri::command]
fn midi_set_port(state: State<'_, Mutex<AppData>>, index: usize) {
    println!("[MIDI] Setting port");
    let mut state = state.lock().unwrap();
    state.current_port = state.midi_ports
                .get(index).cloned();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            println!("[MIDI] Hydrating app with ports");
            // We create the MIDI class here to hydrate state with available ports
            let midi_out = MidiOutput::new("My Test Output").unwrap();
            let midi_ports = midi_out.ports();
            app.manage(Mutex::new(AppData {
                midi_channel: midi_out,
                midi_ports: midi_ports,
                current_port: None,
                connection: None,
            }));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![midi_connect_to_port, midi_play_note, midi_play_notes, midi_get_ports,midi_set_port,midi_play_note_press, midi_play_note_release])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
