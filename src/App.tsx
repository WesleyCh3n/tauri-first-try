import { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { readTextFile } from "@tauri-apps/api/fs";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import * as d3 from "d3";

function App() {
  const [file, setFile] = useState("");
  const [helloString, setHelloString] = useState("");


  useEffect(() => {
    let unlisteners: Promise<UnlistenFn>[] = []
    unlisteners.push(listen('tauri://move', ({ event, payload }) => {
      console.log(payload);
    }))
    unlisteners.push(listen('tauri://menu', ({ event, payload }) => {
      console.log(payload);
    }))

    return () => {
      unlisteners.forEach(unlisten => { unlisten.then((f) => f()) })
    };
  })

  const openDialog = () => {
    open({
      title: "File Picker",
      filters: [
        { name: "CSV File", extensions: ["csv"] },
        { name: "All", extensions: ["*"] },
      ],
      multiple: false,
      directory: false,
    }).then((res) => {
      if (Array.isArray(res) || !res) {
        return;
      }
      setFile(res);
      readTextFile(res).then(res => {
        var data = d3.csvParse(res)
        console.log(data.length);
        console.log(data);
      })
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <button type="button" onClick={openDialog}>
          Open File
        </button>
        <p> file is: {file} </p>
        <button
          type="button"
          onClick={() =>
            invoke("hello", { name: "Wesley" }).then((msg) => {
              setHelloString(msg as string);
            })
          }
        >
          Invoke Rust Func
        </button>
        <p> {helloString ? helloString : "None"} </p>
        <button type="button" onClick={() => invoke("open_dialog")}>
          Open Dialog From Rust
        </button>
      </header>
    </div>
  );
}

export default App;
