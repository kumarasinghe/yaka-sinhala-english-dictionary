let tooltipContainer;
let tooltipData = { x: "-100%", y: "-100%" };
let tooltipVisibility;
const anchorImageUrl = chrome.runtime.getURL("assets/anchor-icon.svg");

function setTooltipData(data) {
  tooltipData = data;
}

function getTooltipData() {
  return tooltipData;
}

function _showTooltipAnchor() {
  const { x, y } = getTooltipData();

  tooltipContainer.innerHTML = `
    <img src="${anchorImageUrl}" style="height:25px; width:25px; drop-shadow(2px 2px 2px rgba(0,0,0,.25));"/>
  `;

  tooltipContainer.style = `
    left: ${x};
    top: ${y}; 
    z-index: 1000;
    background-color: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
    position: absolute;
    border: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  `;
}

function _renderTooltipContent() {
  const { x, y, title, description, isPerfectMatch } = getTooltipData();

  tooltipContainer.style = `
    left: ${x};
    top: ${y}; 
    z-index: 1000;
    background-color: transparent;
    outline: none;
    padding: 0;
    margin: 0;
    position: absolute;
    max-width: 250px;
    overflow: hidden;
    border: none;
    border-radius: 8px;
    box-shadow: rgb(0 0 0 / 15%) 0px 2px 4px 1px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  `;

  tooltipContainer.innerHTML = `
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

function setTooltipVisibility(visibility) {
  if (tooltipVisibility === visibility) return;

  if (!tooltipVisibility) {
    _showTooltipAnchor();
  } else {
    if (tooltipContainer) {
      tooltipContainer.style = `display: none;`;
    }
  }

  tooltipVisibility = visibility;
}

function _initTooltip() {
  tooltipContainer = document.createElement("dialog");
  tooltipContainer.setAttribute("open", true);
  tooltipContainer.style = "display: none";
  tooltipContainer.onclick = _renderTooltipContent;
  document.body.prepend(tooltipContainer);
}

window.addEventListener("load", () => {
  _initTooltip();
});
