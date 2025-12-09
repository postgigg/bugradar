import {
  BugRadar
} from "./chunk-VBTOTUFO.mjs";

// src/index.ts
if (typeof window !== "undefined") {
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");
  if (apiKey) {
    import("./client-ANFT3PIW.mjs").then(({ BugRadar: BugRadar2 }) => {
      BugRadar2.init(apiKey);
    });
  }
}
export {
  BugRadar
};
