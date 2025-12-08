import {
  BugRadar
} from "./chunk-MGZUODX5.mjs";

// src/index.ts
if (typeof window !== "undefined") {
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");
  if (apiKey) {
    import("./client-ZADGKTAD.mjs").then(({ BugRadar: BugRadar2 }) => {
      BugRadar2.init(apiKey);
    });
  }
}
export {
  BugRadar
};
