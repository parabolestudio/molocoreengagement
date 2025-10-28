import { html, renderComponent } from "./js/utils/preact-htm.js";

console.log("Viz script loaded");

let containerElement = document.querySelector(`#vis-1`);

if (containerElement) {
  renderComponent(html`<p>script test</p>`, containerElement);
} else {
  console.error(
    `Could not find container element for general filter with id ${containerId}`
  );
}
