import {
  html,
  useEffect,
  useState,
  renderComponent,
} from "./utils/preact-htm.js";
import { REPO_BASE_URL, populateCountrySelectors } from "./utils/helpers.js";

export function Vis1() {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState("United States");
  const [category, setCategory] = useState("consumer");
  const [installType, setInstallType] = useState("payer");

  useEffect(() => {
    // Fetch data when the component mounts
    d3.csv(
      `${REPO_BASE_URL}/data/vis1_data.csv`
      //   `./data/vis1_data.csv`
    ).then((fetchedData) => {
      fetchedData.forEach((d) => {
        d["uninstallRate"] = +d["uninstall_rate"].replace("%", "");
        d["category"] =
          d["vertical"].toLowerCase() === "gaming"
            ? "gaming"
            : d["vertical"].toLowerCase() === "non-gaming"
            ? "consumer"
            : null;
        d["installType"] = d["install_type"].toLowerCase();
      });

      setData(fetchedData);

      const uniqueCountries = Array.from(
        new Set(fetchedData.map((d) => d.country))
      );

      populateCountrySelectors(uniqueCountries, "#vis-1-dropdown-countries");

      // render category switcher
      renderSwitcher(
        [
          { label: "Consumer", value: "consumer" },
          { label: "Gaming", value: "non-consumer" },
        ],
        "vis-1-dropdown-categories"
      );
      // render install type switcher
      renderSwitcher(
        [
          { label: "Paid", value: "non-organic" },
          { label: "Organic", value: "organic" },
        ],
        "vis-1-dropdown-install-types"
      );
    });
  }, []);

  if (!data) {
    return html`<div>Loading data...</div>`;
  }
  const filteredData = data.filter(
    (d) =>
      d.country === country &&
      d.category === category &&
      d.installType === installType
  );

  console.log("Rendering vis 1 with ", {
    country,
    category,
    installType,
    data,
    filteredData,
  });

  return html`<div>Vis1</div>`;
}

function renderSwitcher(items, containerId) {
  const containerElement = document.getElementById(containerId);
  if (containerElement) {
    containerElement.innerHTML = "";
    (async () => {
      renderComponent(html`<${Switcher} items=${items} />`, containerElement);
    })();
  } else {
    console.error(`Could not find container element for ${containerId}`);
  }
}

function Switcher({ items }) {
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
        class="vis-switcher-item ${item.value === activeItem
          ? "vis-switcher-item-active"
          : ""}"
        onclick=${() => setActiveItem(item.value)}
      >
        ${item.label}
      </div>`
    )}
  </div>`;
}
