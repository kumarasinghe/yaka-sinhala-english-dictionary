let tootip;
const anchorImageUrl = chrome.runtime.getURL("assets/anchor-icon.svg");

function showTooltipAnchor(tooltipData) {
  if (tootip.open) return;

  const { x, y } = tooltipData;

  tootip.style = `
      z-index: 1000;
      outline: none;
      padding: 0;
      margin: 0;
      position: absolute;
      overflow: hidden;
      border: none;
      background-color: transparent;
      cursor: pointer;
      transform: translate(-50%, -50%);
      top: ${y}px; 
      left: ${x}px;
    `;

  tootip.innerHTML = `
    <img src="${anchorImageUrl}" style="height:25px; width:25px; drop-shadow(2px 2px 2px rgba(0,0,0,.25));"/>
    `;

  tootip.onclick = () => {
    renderTooltip(tooltipData);
  };

  tootip.show();
}

function renderTooltip(tooltipData) {
  const { title, description, x, y, isPerfectMatch } = tooltipData;

  tootip.style = `
      z-index: 1000;
      outline: none;
      padding: 0;
      margin: 0;
      position: absolute;
      max-width: 250px;
      overflow: hidden;
      border: none;
      border-radius: 8px;
      box-shadow: rgb(0 0 0 / 15%) 0px 2px 4px 1px;
      top: ${y}px; 
      left: ${x}px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    `;

  tootip.innerHTML = `
      <div style="font-weight: bold; font-size: 12px; color: white; background-color: ${
        isPerfectMatch ? "darkcyan" : "slategray"
      }; padding: 5px 10px;">${
    isPerfectMatch ? title.toUpperCase() : `FOUND : ${title.toUpperCase()}`
  }</div>
      <div style="font-size: 12px; font-weight: bold; color: ${
        isPerfectMatch ? "darkcyan" : "slategray"
      }; background-color: white; padding: 5px 10px;">${description}</div>
    `;
}

function initTooltip() {
  tootip = document.createElement("dialog");
  tootip.setAttribute("tabindex", 0);
  tootip.onblur = tootip.close;
  document.body.prepend(tootip);
}

window.addEventListener("load", () => {
  initTooltip();
});
