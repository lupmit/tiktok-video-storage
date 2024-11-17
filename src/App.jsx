import React from "react";
import { Routes, Route } from "react-router-dom";
import Upload from "./container/Upload/Upload";
import Video from "./container/Video/Video";
import "./index.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/video/:videoID" element={<Video />} />
      </Routes>
    </div>
  );
}

export default App;
