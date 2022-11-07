function extractWord(text) {
  text = text.trim();
  // check if text contains only one word and not a phrase
  if (text.indexOf(" ") === -1) {
    return text.toLowerCase();
  }
}

async function findDefinition(word) {
  let definitions = await new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "FIND_DEFINITION", data: { word } },
      resolve
    );
  });

  if (definitions.length) return { word, definitions };

  /**** try changing word form when no definitions found ****/

  for await (const postfix of ["ed", "ing", "s", "ies", "'s", "ly", "able"]) {
    if (word.endsWith(postfix)) {
      const wordForm = word.substring(0, word.length - postfix.length);

      definitions = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: "FIND_DEFINITION", data: { word: wordForm } },
          resolve
        );
      });

      if (definitions.length) return { word: wordForm, definitions };
    }
  }

  return { word, definitions: [] };
}

async function textSelectHandler(event) {
  const { srcElement, pageY, pageX } = event;

  // prevent suggestions for input elements
  if (srcElement instanceof HTMLInputElement) {
    return;
  }

  // extract selected word
  const selectedText = window.getSelection()?.toString();
  const selectedWord = extractWord(selectedText);
  if (!selectedWord) return;

  // find the definition
  const { word, definitions } = await findDefinition(selectedWord);

  // stop if no definitions found
  if (!definitions.length) return;

  // exists in the same js context
  showTooltipAnchor({
    title: word,
    isPerfectMatch: selectedWord === word,
    description: definitions.join("  |  "),
    x: pageX,
    y: pageY - 30,
  });
}

document.addEventListener("mouseup", textSelectHandler);
