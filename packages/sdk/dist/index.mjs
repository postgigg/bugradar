import {
  BugRadar
} from "./chunk-UD7KR44M.mjs";

// src/index.ts
if (typeof window !== "undefined") {
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");
  if (apiKey) {
    import("./client-YWPCFD2X.mjs").then(({ BugRadar: BugRadar2 }) => {
      BugRadar2.init(apiKey);
    });
  }
}
export {
  BugRadar
};
