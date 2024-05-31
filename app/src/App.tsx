import { createRoot } from "react-dom/client";
import React from "react";
import "../static/reset.sass";
import "../static/index.sass";
import { Sidebar } from "./components/Sidebar";
import { Main } from "./components/Main";

const root = createRoot(document.getElementById("container"));
root.render(
  <>
    <Sidebar />
    <Main />
  </>,
);
