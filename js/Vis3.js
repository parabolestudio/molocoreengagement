import { html, useState, useEffect } from "./utils/preact-htm.js";
import { REPO_BASE_URL, countryLabels, isMobile } from "./utils/helpers.js";
import { renderSwitcher } from "./Switcher.js";

export function Vis3() {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [metric, setMetric] = useState("cpa");
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    // render category switcher
    renderSwitcher(
      [
        { label: "CPA", value: "cpa" },
        { label: "ROAS", value: "roas" },
      ],
      "vis-3-dropdown-metrics"
    );

    // Fetch data when the component mounts
    d3.csv(`${REPO_BASE_URL}/data/vis3_data.csv`).then((fetchedData) => {
      fetchedData.forEach((d) => {
        d["appNumber"] =
          d["app_number"] && d["app_number"] !== ""
            ? +d["app_number"].split(" ")[1].trim()
            : null;
        d["appType"] =
          d["app_type_and_country"] && d["app_type_and_country"] !== ""
            ? d["app_type_and_country"].split("(")[0].trim()
            : null;
        d["cpa"] =
          d["cpa_improvement"] && d["cpa_improvement"] !== ""
            ? +d["cpa_improvement"]
            : null;
        d["roas"] =
          d["roas_ratio"] && d["roas_ratio"] !== "" ? +d["roas_ratio"] : null;
      });

      setData(fetchedData);

      const newFilteredData = fetchedData.filter((d) => d[metric] !== null);
      newFilteredData.sort((a, b) => b[metric] - a[metric]);
      setFilteredData(newFilteredData);
    });
  }, []);

  // listen to metric change events
  useEffect(() => {
    const handleMetricChange = (e) => {
      setMetric(e.detail.activeItem);
    };
    document.addEventListener(
      `vis-3-dropdown-metrics-switched`,
      handleMetricChange
    );
    return () => {
      document.removeEventListener(
        `vis-3-dropdown-metrics-switched`,
        handleMetricChange
      );
    };
  }, []);

  useEffect(() => {
    // reset hovered item when metric changes
    setHoveredItem(null);

    // sort data based on new metric
    if (filteredData) {
      let newFilteredData = data.filter((d) => d[metric] !== null);
      newFilteredData = [...newFilteredData].sort(
        (a, b) => b[metric] - a[metric]
      );
      setFilteredData(newFilteredData);
    }
  }, [metric]);

  if (!data) {
    return html`<div>Loading data...</div>`;
  }

  // console.log("Rendering vis 3", { data, metric, filteredData });

  // dimensions
  const visContainer = document.querySelector("#vis-3");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const margin = {
    top: 1,
    right: 1,
    bottom: 30,
    left: 75,
  };
  const height = 600;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const allApps = filteredData.map((d) => d.appNumber);
  const yScale = d3
    .scaleBand()
    .domain(allApps)
    .range([0, innerHeight])
    .paddingInner(0.2)
    .paddingOuter(0.25);
  const absMaxMetricValue = d3.max(filteredData, (d) => Math.abs(d[metric]));
  const xScale = d3
    .scaleLinear()
    .domain([-absMaxMetricValue, absMaxMetricValue])
    .range([0, innerWidth])
    .nice();

  // ticks
  const xTicks = xScale.ticks(5);

  // find out first app number with negative metric value
  const firstNegativeApp = filteredData.find((d) => d[metric] < 0);
  const yZero =
    yScale(firstNegativeApp.appNumber - 1) +
    yScale.bandwidth() +
    (yScale.paddingInner() * yScale.bandwidth()) / 2;

  return html`<div style="position: relative;">
    <svg
      viewBox="0 0 ${width} ${height}"
      onmousemove="${(event) => {
        const pointer = d3.pointer(event);

        const topSide = margin.top;
        const bottomSide = topSide + innerHeight;

        if (pointer[1] >= topSide && pointer[1] <= bottomSide) {
          const innerY = pointer[1] - margin.top;

          const step = yScale.step();
          const bandIndex = Math.floor(innerY / step);
          const domain = yScale.domain();

          // Make sure we're within bounds
          if (bandIndex >= 0 && bandIndex < domain.length) {
            const hoveredAppNumber = domain[bandIndex];

            // get value for hoveredItem
            const datapoint =
              filteredData.find((d) => d.appNumber === hoveredAppNumber) || {};
            setHoveredItem({
              x:
                xScale(datapoint[metric]) < xScale(0)
                  ? xScale(0) + margin.left + 20
                  : xScale(0) + 20,
              y: margin.top + yScale(hoveredAppNumber),
              appNumber: hoveredAppNumber,
              datapoint: datapoint || null,
              metric,
              align: xScale(datapoint[metric]) < xScale(0) ? "left" : "right",
            });
          } else {
            setHoveredItem(null);
          }
        } else {
          setHoveredItem(null);
        }
      }}"
      onmouseleave="${() => setHoveredItem(null)}"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <rect
          x="0"
          y="0"
          width="${xScale(0)}"
          height="${innerHeight}"
          fill="#040078"
          fill-opacity="0.1"
        />
        <rect
          x="${xScale(0)}"
          y="0"
          width="${xScale(xScale.domain()[1]) - xScale(0)}"
          height="${innerHeight}"
          fill="#DBA4FB"
          fill-opacity="0.1"
        />
        <g>
          ${xTicks.map(
            (tick) => html` <g
              transform="translate(${xScale(tick)}, ${innerHeight})"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-${innerHeight}"
                stroke="#D9D9D9"
                stroke-width="0.75"
              />
              <text
                x="0"
                y="15"
                text-anchor="middle"
                class="charts-text-body"
                fill="#04033A"
              >
                ${tick}
              </text>
            </g>`
          )}
        </g>

        <g>
          ${filteredData.map((d, i) => {
            return html` <g
              transform="translate(0, ${yScale(d.appNumber) +
              yScale.bandwidth() / 2})"
            >
              <text
                x="${-margin.left}"
                class="charts-text-body"
                dominant-baseline="middle"
                fill="#04033A"
                >App #${i + 1}</text
              >
              <line
                x1="${xScale(0)}"
                y1="0"
                x2="${d[metric] === null ? xScale(0) : xScale(d[metric])}"
                y2="0"
                stroke="${hoveredItem && hoveredItem.appNumber === d.appNumber
                  ? "#04033A"
                  : d[metric] < 0
                  ? "#040078"
                  : "#C368F9"}"
                stroke-width="2"
                style="transition: all 0.3s ease;"
              />
              <circle
                cx="${d[metric] === null ? xScale(0) : xScale(d[metric])}"
                r="5"
                fill="${hoveredItem && hoveredItem.appNumber === d.appNumber
                  ? "#04033A"
                  : d[metric] < 0
                  ? "#040078"
                  : "#C368F9"}"
                opacity="${d[metric] === null ? 0 : 1}"
                style="transition: all 0.3s ease;"
              />
            </g>`;
          })}

          <text
            x="${isMobile ? innerWidth - 5 : innerWidth - 20}"
            y="${yZero - 20}"
            text-anchor="end"
            dominant-baseline="middle"
            class="charts-text-body-bold"
            fill="#C368F9"
          >
            RE more efficient →
          </text>
          <text
            x="${isMobile ? 5 : 20}"
            y="${yZero + 20}"
            text-anchor="start"
            dominant-baseline="middle"
            class="charts-text-body-bold"
            fill="#040078"
          >
            ← RE less efficient
          </text>
          <text
            x="${xScale(0)}"
            y="${innerHeight + 30}"
            text-anchor="middle"
            dominant-baseline="middle"
            class="charts-text-body"
            fill="#04033A"
          >
            Change in ${metric.toUpperCase()} (Log2 Scale)
          </text>
        </g>
      </g>
    </svg>
    <${Tooltip} hoveredItem=${hoveredItem} />
  </div>`;
}

function Tooltip({ hoveredItem }) {
  if (!hoveredItem || hoveredItem.datapoint[hoveredItem.metric] === null)
    return null;

  return html`<div
    class="tooltip"
    style="${hoveredItem.align}: ${hoveredItem.x}px; top: ${hoveredItem.y}px; ${hoveredItem.align ===
    "right"
      ? "left: unset;"
      : ""}"
  >
    <div>
      <p class="tooltip-label">App type</p>
      <p class="tooltip-value">
        ${hoveredItem.datapoint.appType ? hoveredItem.datapoint.appType : "N/A"}
      </p>
    </div>

    <div>
      <p class="tooltip-label">Country</p>
      <p class="tooltip-value">
        ${hoveredItem.datapoint.country
          ? countryLabels[hoveredItem.datapoint.country]
          : "N/A"}
      </p>
    </div>

    <div>
      <p class="tooltip-label">${hoveredItem.metric.toUpperCase()} change</p>
      <p class="tooltip-value">
        ${hoveredItem.datapoint[hoveredItem.metric]
          ? hoveredItem.datapoint[hoveredItem.metric].toFixed(1)
          : null}
      </p>
    </div>
  </div>`;
}
