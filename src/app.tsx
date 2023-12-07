import { createRoot } from "react-dom/client";
import React from "react";
import "../static/reset.sass";
import "../static/index.sass";

const root = createRoot(document.getElementById("root"));
root.render(<h2>Hello from React!</h2>);
