import {
  BugRadar
} from "./chunk-HVBXOL6S.mjs";

// src/index.ts
if (typeof window !== "undefined") {
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");
  if (apiKey) {
    import("./client-JBXDLEHR.mjs").then(({ BugRadar: BugRadar2 }) => {
      BugRadar2.init(apiKey);
    });
  }
}
export {
  BugRadar
};
