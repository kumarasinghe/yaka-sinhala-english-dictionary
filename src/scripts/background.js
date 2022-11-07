import { findDefinition } from "../controllers/dictionary.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "FIND_DEFINITION":
      findDefinition(request.data?.word).then((result) => sendResponse(result));
    default:
      break;
  }

  return true; // enables async mode
});
