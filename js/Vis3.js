import { html, useState, useEffect } from "./utils/preact-htm.js";
import { REPO_BASE_URL } from "./utils/helpers.js";
import { renderSwitcher } from "./Switcher.js";

export function Vis3() {
  const [data, setData] = useState(null);
  const [metric, setMetric] = useState("cpa");

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

      fetchedData.sort((a, b) => a.appNumber - b.appNumber);

      setData(fetchedData);
    });
  }, []);

  // listen to metric change events
  useEffect(() => {
    const handleMetricChange = (e) => setMetric(e.detail.activeItem);
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

  if (!data) {
    return html`<div>Loading data...</div>`;
  }

  console.log("Rendering vis 3", { data, metric });

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
  const allApps = data.map((d) => d.appNumber);
  const yScale = d3
    .scaleBand()
    .domain(allApps)
    .range([0, innerHeight])
    .paddingInner(0.2)
    .paddingOuter(0.5);
  const absMaxMetricValue = d3.max(data, (d) => Math.abs(d[metric]));
  const xScale = d3
    .scaleLinear()
    .domain([-absMaxMetricValue, absMaxMetricValue])
    .range([0, innerWidth])
    .nice();

  // ticks
  const xTicks = xScale.ticks(5);

  // find out first app number with negative metric value
  const firstNegativeApp = data.find((d) => d[metric] < 0);
  const yZero =
    yScale(firstNegativeApp.appNumber - 1) +
    yScale.bandwidth() +
    (yScale.paddingInner() * yScale.bandwidth()) / 2;

  return html`<div>
    <svg viewBox="0 0 ${width} ${height}">
      <g transform="translate(${margin.left}, ${margin.top})">
        <g>
          ${data.map(
            (d) => html`
              <text
                x="${-margin.left}"
                y="${yScale(d.appNumber) + yScale.bandwidth() / 2}"
                class="charts-text-body"
                dominant-baseline="middle"
                fill="#04033A"
                >App #${d.appNumber}</text
              >
            `
          )}
        </g>
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
              <text x="0" y="15" text-anchor="middle" class="charts-text-body">
                ${tick}
              </text>
            </g>`
          )}
        </g>

        <g>
          ${data.map((d) => {
            if (d[metric] === null) {
              return null;
            }
            return html` <g
              transform="translate(0, ${yScale(d.appNumber) +
              yScale.bandwidth() / 2})"
            >
              <line
                x1="${xScale(0)}"
                y1="0"
                x2="${xScale(d[metric])}"
                y2="0"
                stroke="${d[metric] < 0 ? "#040078" : "#C368F9"}"
                stroke-width="2"
              />
              <circle
                cx="${xScale(d[metric])}"
                r="5"
                fill="${d[metric] < 0 ? "#040078" : "#C368F9"}"
              />
            </g>`;
          })}

          <line
            x1="0"
            y1="${yZero}"
            x2="${innerWidth}"
            y2="${yZero}"
            stroke="#D9D9D9"
            stroke-width="0.75"
          />
          <text
            x="${innerWidth - 20}"
            y="${yZero - 20}"
            text-anchor="end"
            dominant-baseline="middle"
            class="charts-text-body-bold"
            fill="#C368F9"
          >
            RE more efficient →
          </text>
          <text
            x="${0 + 20}"
            y="${yZero + 20}"
            text-anchor="start"
            dominant-baseline="middle"
            class="charts-text-body-bold"
            fill="#040078"
          >
            ← RE less efficient
          </text>
        </g>
      </g>
    </svg>
  </div>`;
}
