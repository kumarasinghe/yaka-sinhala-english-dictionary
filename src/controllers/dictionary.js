const definitionFilename = chrome.runtime.getURL("assets/definitions");

export async function findDefinition(word) {
  // dynamically load definitions as we don't want to hold them in memory
  const response = await fetch(definitionFilename);
  const definitionText = await response.text();

  const definitionRegExp = new RegExp(`(^|.+\t)${word}(\t.+\r|\r)`, "gimu");
  const matches = definitionText.match(definitionRegExp) || [];
  const cleanerRegExp = new RegExp(`${word}|\t|\r`, "gim");
  const results = [];

  for (const match of matches) {
    const definition = match.replaceAll(cleanerRegExp, "");
    results.push(definition);
  }

  return results;
}
