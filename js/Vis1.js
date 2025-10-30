import {
  html,
  useEffect,
  useState,
  renderComponent,
} from "./utils/preact-htm.js";
import { REPO_BASE_URL, populateCountrySelectors } from "./utils/helpers.js";

export function Vis1() {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState("USA");
  const [category, setCategory] = useState("consumer");
  const [installType, setInstallType] = useState("non-organic");

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
        d["vertical"] = d["subvertical"].toLowerCase();
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
          { label: "Gaming", value: "gaming" },
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

  // listen to country change events
  useEffect(() => {
    const handleCountryChange = (e) => setCountry(e.detail.selected);
    document.addEventListener(
      `#vis-1-dropdown-countries-changed`,
      handleCountryChange
    );
    return () => {
      document.removeEventListener(
        `#vis-1-dropdown-countries-changed`,
        handleCountryChange
      );
    };
  }, []);

  // listen to category change events
  useEffect(() => {
    const handleCategoryChange = (e) => setCategory(e.detail.activeItem);
    document.addEventListener(
      `vis-1-dropdown-categories-switched`,
      handleCategoryChange
    );
    return () => {
      document.removeEventListener(
        `vis-1-dropdown-categories-switched`,
        handleCategoryChange
      );
    };
  }, []);

  // listen to install type change events
  useEffect(() => {
    const handleInstallTypeChange = (e) => setInstallType(e.detail.activeItem);
    document.addEventListener(
      "vis-1-dropdown-install-types-switched",
      handleInstallTypeChange
    );
    return () => {
      document.removeEventListener(
        "vis-1-dropdown-install-types-switched",
        handleInstallTypeChange
      );
    };
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

  // dimensions
  const visContainer = document.querySelector("#vis-1");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const height = 600;
  const margin = {
    top: 10,
    right: 60,
    bottom: 30,
    left: 150,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
  const rowHeight = 44;
  const rowPadding = 15;

  function formatText(text) {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const verticalRows = filteredData.map((d, i) => {
    return html`<g transform="translate(0, ${i * (rowHeight + rowPadding)})">
      <text
        x="-16"
        y="${rowHeight / 2 + 5}"
        text-anchor="end"
        class="charts-text-body"
        fill="#04033A"
      >
        ${formatText(d.vertical)}
      </text>
      <rect
        x="${xScale(d.uninstallRate)}"
        y="0"
        width="${innerWidth - xScale(d.uninstallRate)}"
        height="${rowHeight}"
        fill="#F2F2F2"
        stroke="white"
        stroke-width="2"
        rx="10"
        ry="10"
        style="transition: all 0.5s ease;"
      />
      <rect
        x="0"
        y="0"
        width="${xScale(d.uninstallRate)}"
        height="${rowHeight}"
        fill="#60E2B7"
        stroke="white"
        stroke-width="2"
        rx="10"
        ry="10"
        style="transition: all 0.5s ease;"
      />

      <text
        dominant-baseline="middle"
        text-anchor="end"
        font-size="18"
        font-weight="700"
        font-family="Spacegrotesk, Space Grotesk, sans-serif"
        fill="#04033A"
        transform="translate(${xScale(d.uninstallRate) - 12}, ${rowHeight / 2 +
        2.5})"
        style="transition: transform 0.5s ease;"
      >
        ${d.uninstallRate.toFixed(0)}%
      </text>
      <text
        x="${innerWidth - 24}"
        y="${rowHeight / 2 + 2.5}"
        dominant-baseline="middle"
        text-anchor="end"
        font-size="18"
        font-weight="700"
        font-family="Spacegrotesk, Space Grotesk, sans-serif"
        fill="#04033A"
      >
        ${(100 - d.uninstallRate).toFixed(0)}%
      </text>
      <g transform="translate(${innerWidth - 10}, ${0})">
        <${TrashcanIcon} />
      </g>
    </g>`;
  });

  return html`<div>
    <svg viewBox="0 0 ${width} ${height}">
      <g transform="translate(${margin.left}, ${margin.top})">
        <rect
          width="${innerWidth}"
          height="${innerHeight}"
          fill="none"
          stroke="none"
        />
        ${verticalRows}
      </g>
    </svg>
  </div>`;
}

const TrashcanIcon = () => html`<svg
  width="60"
  height="44"
  fill="none"
  viewBox="0 0 60 44"
>
  <g class="Group 2217">
    <g class="Group 2216">
      <path
        fill="#F2F2F2"
        stroke="#fff"
        stroke-width="2"
        d="M49.77 1a9 9 0 0 1 9 9v24a9 9 0 0 1-9 9H10V1h39.77Z"
        class="Rectangle 2535"
      />
      <g class="Group 2161">
        <path
          stroke="#737373"
          stroke-width="1.5"
          d="M41.001 18.107v12.995a4.25 4.25 0 0 1-4.25 4.25h-8.745a4.25 4.25 0 0 1-4.25-4.25V18.108H41Z"
          class="Rectangle 975"
        />
        <path
          stroke="#737373"
          stroke-width="1.5"
          d="M23.001 11.858h18.746a2.374 2.374 0 0 1 2.374 2.374.813.813 0 0 1-.812.813h-21.87a.813.813 0 0 1-.812-.813c0-1.229.934-2.24 2.132-2.36l.242-.014Z"
          class="Rectangle 976"
        />
        <path
          stroke="#737373"
          stroke-width="1.5"
          d="M32.378 6.39h.781a2.374 2.374 0 0 1 2.374 2.375.812.812 0 0 1-.811.812h-3.906a.813.813 0 0 1-.812-.812 2.374 2.374 0 0 1 2.374-2.374Z"
          class="Rectangle 977"
        />
        <path
          stroke="#737373"
          stroke-width="1.5"
          d="M27.686 32.197V21.262"
          class="Vector 314"
        />
        <path
          stroke="#737373"
          stroke-width="1.5"
          d="M32.375 32.197V21.262"
          class="Vector 315"
        />
        <path
          stroke="#737373"
          stroke-width="1.5"
          d="M37.065 32.197V21.262"
          class="Vector 316"
        />
      </g>
    </g>
    <path fill="#fff" d="M0 0h9v44H0z" class="Rectangle 2536" />
  </g>
</svg> `;

function renderSwitcher(items, containerId) {
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
