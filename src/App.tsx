import { createRoot } from "react-dom/client";
import React from "react";
import "../static/reset.sass";
import "../static/index.sass";
import { Sidebar } from "./components/Sidebar";
import { Background } from "./components/Main";

const root = createRoot(document.getElementById("container"));
root.render(
  <>
    <Sidebar />
    <Background />
  </>,
);
