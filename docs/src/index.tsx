import { createRoot } from "react-dom/client";
import Demo from "./Demo";
import { calcDiff, calcDiffWithArrayAlign } from "../../src/index";
import React from "react";

createRoot(document.getElementById("root")!).render(<Demo></Demo>);

declare global {
  interface Window {
    calcDiff: typeof calcDiff;
    calcDiffWithArrayAlign: typeof calcDiffWithArrayAlign;
  }
}

window.calcDiff = calcDiff;
window.calcDiffWithArrayAlign = calcDiffWithArrayAlign;
