import {
  BugRadar
} from "./chunk-SBLVAG7T.mjs";

// src/index.ts
if (typeof window !== "undefined") {
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");
  if (apiKey) {
    import("./client-SSD6JBVT.mjs").then(({ BugRadar: BugRadar2 }) => {
      BugRadar2.init(apiKey);
    });
  }
}
export {
  BugRadar
};
