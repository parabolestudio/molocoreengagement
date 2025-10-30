import { html, useEffect, useState } from "./utils/preact-htm.js";
import {
  REPO_BASE_URL,
  populateCountrySelectors,
  formatText,
} from "./utils/helpers.js";
import { renderSwitcher } from "./Switcher.js";

export function Vis1() {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState("USA");
  const [category, setCategory] = useState("consumer");
  const [installType, setInstallType] = useState("non-organic");

  useEffect(() => {
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
  const rowHeight = 44;
  const rowPadding = 15;
  const visContainer = document.querySelector("#vis-1");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const margin = {
    top: 1,
    right: 60,
    bottom: 40,
    left: 150,
  };
  const numberOfRows = 8;
  const height =
    rowHeight * numberOfRows +
    rowPadding * (numberOfRows - 1) +
    margin.top +
    margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

  const verticalRows = filteredData.map((d, i) => {
    return html`<g transform="translate(0, ${i * (rowHeight + rowPadding)})">
      <text
        x="${-margin.left}"
        y="${rowHeight / 2 + 5}"
        text-anchor="start"
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
        <g>
          ${filteredData.map((d, i) => {
            return html`<rect
              x="${innerWidth - 10}"
              y="${i * (rowHeight + rowPadding) + 5}"
              width="40"
              height="${rowHeight - 10}"
              fill="#F2F2F2"
            />`;
          })}
          <rect
            x="${innerWidth - 10 + 30}"
            y="${0 * (rowHeight + rowPadding) + 5}"
            width="20"
            height="${filteredData.length * (rowHeight + rowPadding)}"
            fill="#F2F2F2"
            rx="10"
            ry="10"
            style="transition: height 0.3s ease;"
          />
          <svg
            width="47"
            height="62"
            fill="none"
            viewBox="0 0 47 62"
            transform="translate(${innerWidth -
            10 +
            20 +
            5}, ${filteredData.length * (rowHeight + rowPadding) -
            62 / 2 -
            10})"
            style="transition: transform 0.3s ease;"
          >
            <path
              fill="#fff"
              stroke="#737373"
              stroke-width="1.5"
              d="m36.604 7.612 1.695 1.626a3.946 3.946 0 0 1 .116 5.578 1.599 1.599 0 0 1-2.26.048l-5.083-4.876a1.599 1.599 0 0 1-.047-2.26 3.946 3.946 0 0 1 5.579-.116Zm-15.86-3.821L42.772 24.92a3.946 3.946 0 0 1 .116 5.578 1.599 1.599 0 0 1-2.26.048L15.213 6.167a1.598 1.598 0 0 1-.046-2.26 3.946 3.946 0 0 1 5.578-.116Zm9.027 28.437V57a4.25 4.25 0 0 1-4.25 4.25H5A4.25 4.25 0 0 1 .75 57V32.228h29.021Z"
            />
            <path
              stroke="#737373"
              stroke-width="1.5"
              d="M7.922 55.69V38.083m7.344 17.607V38.083M22.89 55.69V38.083"
            />
          </svg>
        </g>
        ${verticalRows}
      </g>
    </svg>
  </div>`;
}
