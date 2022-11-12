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
  const { pageY, pageX, target } = event;

  // extract selected word
  const selectedText = window.getSelection()?.toString();
  const selectedWord = extractWord(selectedText);

  if (!selectedWord) {
    // hide tooltip if clicked outside
    if (!tooltipContainer.contains(target)) {
      setTooltipVisibility(false);
    }
    return;
  }

  // find the definition
  const { word, definitions } = await findDefinition(selectedWord);

  // stop if no definitions found
  if (!definitions.length) return;

  // exists in the same js context
  setTooltipData({
    title: word,
    isPerfectMatch: selectedWord === word,
    description: definitions.join("  |  "),
    x: `${pageX}px`,
    y: `${pageY - 30}px`,
  });

  setTooltipVisibility(true);
}

document.addEventListener("mouseup", textSelectHandler);
