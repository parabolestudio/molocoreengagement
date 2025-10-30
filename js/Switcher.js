import { html, renderComponent, useState } from "./utils/preact-htm.js";

export function renderSwitcher(items, containerId) {
  const containerElement = document.getElementById(containerId);
  if (containerElement) {
    containerElement.innerHTML = "";
    (async () => {
      renderComponent(
        html`<${Switcher} items=${items} containerId=${containerId} />`,
        containerElement
      );
    })();
  } else {
    console.error(`Could not find container element for ${containerId}`);
  }
}

function Switcher({ items, containerId }) {
  if (!items || items.length === 0) {
    items = [
      { label: "Consumer", value: "consumer" },
      { label: "Gaming", value: "non-consumer" },
    ];
  }

  const [activeItem, setActiveItem] = useState(items[0].value);

  return html`<div class="vis-switcher-container">
    ${items.map(
      (item) => html`<div
        class="vis-switcher-item ${item.value === activeItem ? "active" : ""}"
        onclick=${() => {
          setActiveItem(item.value);
          document.dispatchEvent(
            new CustomEvent(`${containerId}-switched`, {
              detail: { activeItem: item.value },
            })
          );
        }}
      >
        ${item.label}
      </div>`
    )}
  </div>`;
}
