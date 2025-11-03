import {
  html,
  renderComponent,
  useEffect,
  useState,
} from "./utils/preact-htm.js";
import {
  REPO_BASE_URL,
  populateCountrySelectors,
  verticalsMap,
  isMobile,
  formatText,
} from "./utils/helpers.js";

const defaultCategory = "consumer";
const defaultVertical = "all";

export function Vis2() {
  const [data, setData] = useState(null);
  const [includedVerticals, setIncludedVerticals] = useState(null);
  const [country, setCountry] = useState("USA");
  const [category, setCategory] = useState(defaultCategory);
  const [vertical, setVertical] = useState(defaultVertical);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    // Fetch data when the component mounts
    Promise.all([
      d3.csv(`${REPO_BASE_URL}/data/vis2_data.csv`),
      d3.csv(`${REPO_BASE_URL}/data/vis2_verticals_inclusion.csv`),
    ]).then(([fetchedData, verticalsData]) => {
      fetchedData.forEach((d) => {
        d["inactivityDays"] = +d["inactivity_days"];
        d["returnPerc"] = +d["return_rate_percentage"];
        d["category"] =
          d["vertical"].toLowerCase() === "gaming"
            ? "gaming"
            : d["vertical"].toLowerCase() === "non-gaming"
            ? "consumer"
            : null;
        d["vertical"] = d["subvertical"].toLowerCase();
        d["installType"] = d["is_payer"].toLowerCase();
      });
      fetchedData = fetchedData.filter((d) => d["vertical"] !== "unclassified");
      setData(fetchedData);

      verticalsData.forEach((d) => {
        d["vertical"] =
          d["vertical"] && d["vertical"] !== ""
            ? d["vertical"].toLowerCase()
            : null;
        d["category"] =
          d["category"] && d["category"].toLowerCase() === "gaming"
            ? "gaming"
            : d["category"] && d["category"].toLowerCase() === "non-gaming"
            ? "consumer"
            : null;
        d["country"] = d["country"];
      });
      setIncludedVerticals(verticalsData);

      const uniqueCountries = Array.from(
        new Set(fetchedData.map((d) => d.country))
      );
      populateCountrySelectors(uniqueCountries, "#vis-2-dropdown-countries");

      // get unique verticals for gaming and consumer category from inclusion list
      const gamingVerticals = Array.from(
        new Set(
          verticalsData
            .filter((d) => d.category === "gaming")
            .map((d) => d.vertical)
        )
      );
      const consumerVerticals = Array.from(
        new Set(
          verticalsData
            .filter((d) => d.category === "consumer")
            .map((d) => d.vertical)
        )
      );
      renderVerticalSelector(gamingVerticals, consumerVerticals);
    });
  }, []);

  if (!data) {
    return html`<div>Loading data...</div>`;
  }

  // listen to country change events
  useEffect(() => {
    const handleCountryChange = (e) => setCountry(e.detail.selected);
    document.addEventListener(
      `#vis-2-dropdown-countries-changed`,
      handleCountryChange
    );
    return () => {
      document.removeEventListener(
        `#vis-2-dropdown-countries-changed`,
        handleCountryChange
      );
    };
  }, []);

  // listen to vertical change events
  useEffect(() => {
    const handleVerticalChange = (e) => setVertical(e.detail.selectedVertical);
    document.addEventListener(`vis-2-vertical-changed`, handleVerticalChange);
    return () => {
      document.removeEventListener(
        `vis-2-vertical-changed`,
        handleVerticalChange
      );
    };
  }, []);

  // listen to category change events
  useEffect(() => {
    const handleCategoryChange = (e) => setCategory(e.detail.selectedCategory);
    document.addEventListener(`vis-2-category-changed`, handleCategoryChange);
    return () => {
      document.removeEventListener(
        `vis-2-category-changed`,
        handleCategoryChange
      );
    };
  }, []);

  let filteredData = data.filter(
    (d) =>
      d.country === country &&
      d.category === category &&
      d.vertical === vertical
  );

  // apply vertical-country inclusion list for filtering data
  if (includedVerticals && includedVerticals.length > 0) {
    filteredData = filteredData.filter((d) => {
      const verticalEntry = includedVerticals.find(
        (v) =>
          v.vertical.toLowerCase() === d.vertical.toLowerCase() &&
          v.country.toLowerCase() === d.country.toLowerCase()
      );
      if (!verticalEntry) {
        return false;
      }
      return true;
    });
  }

  // console.log("Render in Vis2:", {
  //   country,
  //   category,
  //   vertical,
  //   data,
  //   filteredData,
  //   hoveredItem,
  //   includedVerticals,
  // });

  // dimensions
  const visContainer = document.querySelector("#vis-2");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const height = isMobile ? 310 : 600;
  const margin = {
    top: 10,
    right: 1,
    bottom: 30,
    left: 50,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(filteredData, (d) => d.inactivityDays) || 30])
    .range([0, innerWidth]);
  const dayZeroSpace = xScale(1) - xScale(0);

  const lineGen = d3
    .line()
    .x((d) => xScale(d.inactivityDays))
    .y((d) => yScale(d.returnPerc))
    .curve(d3.curveCatmullRom);

  const datapointsPayer = filteredData
    .filter((d) => d.installType === "payer")
    .sort((a, b) => a.inactivityDays - b.inactivityDays);
  const datapointsNonPayer = filteredData
    .filter((d) => d.installType === "non-payer")
    .sort((a, b) => a.inactivityDays - b.inactivityDays);

  // prepend a starting point at day 0, 100% return rate
  datapointsPayer.unshift({ inactivityDays: 0, returnPerc: 100 });
  datapointsNonPayer.unshift({ inactivityDays: 0, returnPerc: 100 });

  const highlightPayer = hoveredItem
    ? datapointsPayer.find((d) => d.inactivityDays === hoveredItem.hoveredDay)
    : null;
  const highlightNonPayer = hoveredItem
    ? datapointsNonPayer.find(
        (d) => d.inactivityDays === hoveredItem.hoveredDay
      )
    : null;

  const day30Payer = yScale(
    datapointsPayer[datapointsPayer.length - 1].returnPerc
  );
  const day30NonPayer = yScale(
    datapointsNonPayer[datapointsNonPayer.length - 1].returnPerc
  );
  const offset = 12;
  const day30PayerOffset =
    day30Payer < day30NonPayer ? (isMobile ? -(offset + 3) : -offset) : offset;
  const day30NonPayerOffset = day30Payer < day30NonPayer ? offset : -offset;

  // current formatted vertical for display
  const currentVerticalItem = verticalsMap.find((v) => v.value === vertical);
  let currentVerticalLabel = vertical;
  if (currentVerticalItem) {
    currentVerticalLabel = currentVerticalItem.label;
  }

  return html`<div style="position: relative">
    <svg
      viewBox="0 0 ${width} ${height}"
      onmousemove="${(event) => {
        if (!filteredData || filteredData.length === 0) return;
        const pointer = d3.pointer(event);

        const leftSide = margin.left;
        const rightSide = leftSide + innerWidth;

        if (pointer[0] >= leftSide && pointer[0] <= rightSide) {
          const innerX = pointer[0] - margin.left;

          const hoveredDay = Math.round(xScale.invert(innerX));

          // get value for hoveredItem
          const datapointPayer =
            datapointsPayer.find((d) => d.inactivityDays === hoveredDay) || {};
          const datapointNonPayer =
            datapointsNonPayer.find((d) => d.inactivityDays === hoveredDay) ||
            {};

          setHoveredItem({
            x: innerX,
            y:
              margin.top +
              yScale(
                Math.max(
                  datapointPayer.returnPerc || 0,
                  datapointNonPayer.returnPerc || 0
                )
              ) -
              170 -
              20,
            hoveredDay,
            variablePayer: datapointPayer.returnPerc || null,
            variableNonPayer: datapointNonPayer.returnPerc || null,
          });
        } else {
          setHoveredItem(null);
        }
      }}"
      onmouseleave="${() => setHoveredItem(null)}"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <rect
          width="${dayZeroSpace}"
          height="${innerHeight + margin.bottom}"
          fill="#D9D9D94D"
          stroke="none"
        />
        <g>
          <line
            x1="0"
            y1="${yScale(0)}"
            x2="${innerWidth}"
            y2="${yScale(0)}"
            stroke="#D9D9D9"
            stroke-width="0.75"
          />
          <line
            x1="0"
            y1="${yScale(50)}"
            x2="${innerWidth}"
            y2="${yScale(50)}"
            stroke="#D9D9D9"
            stroke-width="0.75"
          />
          <line
            x1="0"
            y1="${yScale(100)}"
            x2="${innerWidth}"
            y2="${yScale(100)}"
            stroke="#D9D9D9"
            stroke-width="0.75"
          />
          <text
            x="-10"
            y="${yScale(0)}"
            dominant-baseline="middle"
            text-anchor="end"
            class="charts-text-body"
            fill="#04033A"
          >
            0
          </text>
          <text
            x="-10"
            y="${yScale(50)}"
            dominant-baseline="middle"
            text-anchor="end"
            class="charts-text-body"
            fill="#04033A"
          >
            50
          </text>
          <text
            x="-10"
            y="${yScale(100)}"
            dominant-baseline="middle"
            text-anchor="end"
            class="charts-text-body"
            fill="#04033A"
          >
            100%
          </text>
          <g transform="translate(0, ${yScale(0) + 25})">
            <text
              x="${xScale(0) + dayZeroSpace + 7}"
              dominant-baseline="middle"
              text-anchor="start"
              class="charts-text-body"
              fill="#04033A"
            >
              Day 1 of inactivity
            </text>
            <text
              x="${xScale(15)}"
              dominant-baseline="middle"
              text-anchor="middle"
              class="charts-text-body"
              fill="#04033A"
            >
              Day 15
            </text>
            <text
              x="${xScale(30)}"
              dominant-baseline="middle"
              text-anchor="end"
              class="charts-text-body"
              fill="#04033A"
            >
              Day 30
            </text>
          </g>
        </g>
        ${datapointsPayer &&
        datapointsPayer.length > 1 &&
        datapointsNonPayer &&
        datapointsNonPayer.length > 1
          ? html` <g>
              <path
                d="${lineGen(datapointsPayer)}"
                stroke="#0280FB"
                stroke-width="3"
                fill="none"
                style="transition: all ease 0.3s"
              />
              <path
                d="${lineGen(datapointsNonPayer)}"
                stroke="#C368F9"
                stroke-width="3"
                fill="none"
                style="transition: all ease 0.3s"
              />
              <text
                transform="translate(${innerWidth}, ${day30Payer +
                day30PayerOffset})"
                text-anchor="end"
                dominant-baseline="middle"
                fill="#0280FB"
                class="charts-text-body-bold"
                style="transition: all ease 0.3s"
              >
                Payers
              </text>

              <text
                transform="translate(${innerWidth}, ${day30NonPayer +
                day30NonPayerOffset})"
                text-anchor="end"
                dominant-baseline="middle"
                fill="#C368F9"
                class="charts-text-body-bold"
                style="transition: all ease 0.3s"
              >
                Non-payers
              </text>
            </g>`
          : null}
        <g>
          ${hoveredItem && highlightPayer
            ? html` <line
                y1="${yScale(highlightPayer ? highlightPayer.returnPerc : 0)}"
                y2="${innerHeight}"
                transform="translate(${xScale(hoveredItem.hoveredDay)}, 0)"
                stroke="#D9D9D9"
                stroke-width="1.2"
                stroke-dasharray="2,2"
                style="transition: all ease 0.3s"
              />`
            : null}
          ${hoveredItem && highlightPayer
            ? html`<circle
                cx="${xScale(hoveredItem.hoveredDay)}"
                cy="${yScale(highlightPayer ? highlightPayer.returnPerc : 0)}"
                r="5"
                fill="#0280FB"
                style="transition: all ease 0.3s"
              />`
            : ""}
          ${hoveredItem && highlightNonPayer
            ? html`<circle
                cx="${xScale(hoveredItem.hoveredDay)}"
                cy="${yScale(
                  highlightNonPayer ? highlightNonPayer.returnPerc : 0
                )}"
                r="5"
                fill="#C368F9"
                style="transition: all ease 0.3s"
              />`
            : ""}
        </g>
        ${datapointsNonPayer &&
        datapointsNonPayer.length > 1 &&
        datapointsPayer &&
        datapointsPayer.length > 1
          ? html` <g transform="translate(15, 10)">
              <${ReturningUsersLabel} />
            </g>`
          : null}
      </g>
    </svg>
    ${filteredData && filteredData.length > 0
      ? html`<${Tooltip} hoveredItem=${hoveredItem} />`
      : null}
    ${datapointsNonPayer &&
    datapointsNonPayer.length > 1 &&
    datapointsPayer &&
    datapointsPayer.length > 1
      ? null
      : html` <div
          style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #FFFFFF; color: #04033A; text-align: center; max-width: 80%; margin-left: ${margin.left}px; margin-top: ${-margin.top}px; text-wrap-style: balance; padding: 8px;"
          class="charts-text-body"
        >
          No sufficient data for ${currentVerticalLabel} in selected country
        </div>`}
  </div>`;
}

function ReturningUsersLabel() {
  return html`<svg width="200" height="33" fill="none" viewBox="0 0 200 33">
    <path
      fill="#04033A"
      d="M.146 3.328a.5.5 0 0 0 0 .707l3.182 3.182a.5.5 0 1 0 .708-.707L1.207 3.682 4.036.853a.5.5 0 1 0-.708-.707L.146 3.328ZM52 16.682h.5v-5h-1v5h.5Zm-8-13v-.5H.5v1H44v-.5Zm16 21v.5h18v-1H60v.5Zm-8-13h.5a8.5 8.5 0 0 0-8.5-8.5v1a7.5 7.5 0 0 1 7.5 7.5h.5Zm0 5h-.5a8.5 8.5 0 0 0 8.5 8.5v-1a7.5 7.5 0 0 1-7.5-7.5H52Z"
    />
    <text x="89" y="29" fill="#04033A" class="charts-text-body">
      Returning users
    </text>
  </svg> `;
}

function Tooltip({ hoveredItem }) {
  if (!hoveredItem) return null;

  return html`<div
    class="tooltip"
    style="left: ${hoveredItem.x}px; top: ${hoveredItem.y}px;"
  >
    <p class="tooltip-title">Day ${hoveredItem.hoveredDay}</p>
    <div>
      <p class="tooltip-label" style="white-space: nowrap">Returning payers</p>
      <p class="tooltip-value">
        ${hoveredItem.variablePayer
          ? hoveredItem.variablePayer.toFixed(0) + "%"
          : null}
      </p>
    </div>

    <div style="border-top: 1px solid #D9D9D9; width: 100%;" />
    <div>
      <p class="tooltip-label" style="white-space: nowrap">
        Returning non-payers
      </p>
      <p class="tooltip-value">
        ${hoveredItem.variableNonPayer
          ? hoveredItem.variableNonPayer.toFixed(0) + "%"
          : null}
      </p>
    </div>
  </div>`;
}

function renderVerticalSelector(gamingVerticals, consumerVerticals) {
  const containerElement = document.getElementById("vis-2-dropdown-verticals");
  if (containerElement) {
    containerElement.innerHTML = "";
    (async () => {
      renderComponent(
        html`<${Vis2DropdownVerticals}
          gamingVerticals=${gamingVerticals}
          consumerVerticals=${consumerVerticals}
        />`,
        containerElement
      );
    })();
  } else {
    console.error(
      `Could not find container element for vis-2-dropdown-verticals`
    );
  }
}

function Vis2DropdownVerticals({
  gamingVerticals = [],
  consumerVerticals = [],
}) {
  const [category, setCategory] = useState(defaultCategory);
  const [vertical, setVertical] = useState(defaultVertical);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleCategoryChange(newCategory) {
    if (newCategory !== category) {
      console.log("Changing category to:", newCategory);
      setCategory(newCategory);

      const newVertical = "all";
      console.log("Resetting vertical to ", newVertical);
      setVertical(newVertical);

      setIsMenuOpen(true);

      document.dispatchEvent(
        new CustomEvent(`vis-2-category-changed`, {
          detail: { selectedCategory: newCategory },
        })
      );
      document.dispatchEvent(
        new CustomEvent(`vis-2-vertical-changed`, {
          detail: { selectedVertical: newVertical },
        })
      );
    } else {
      // click on same category - toggle menu for the clicked position
      setIsMenuOpen(!isMenuOpen);
    }
  }

  //   function filterVerticalsByIncluded(verticals, includedVerticals) {
  //     if (!includedVerticals || includedVerticals.length === 0) {
  //       return verticals;
  //     }
  //     return verticals.filter((v) => includedVerticals.includes(v.value));
  //   }

  const getVerticalItems = () => {
    // const verticalSet =
    //   category === "gaming"
    //     ? filterVerticalsByIncluded(gamingVerticals, includedVerticals)
    //     : filterVerticalsByIncluded(consumerVerticals, includedVerticals);
    const verticalSet =
      category === "gaming" ? gamingVerticals : consumerVerticals;

    // enrich verticalSet with labels from verticalsMap
    const enrichedVerticalSet = verticalSet
      .map((item) => {
        const el = verticalsMap.find((v) => v.value === item);
        if (el) {
          return el;
        }
        return {
          label: "!" + item,
          value: item,
        };
      })
      .sort((a, b) => {
        if (a.value === "all") return -1;
        if (b.value === "all") return 1;
        return a.label.localeCompare(b.label);
      });

    return enrichedVerticalSet.map((item) => {
      return html`<li
        class="vertical-item ${vertical === item.value ? "active" : "inactive"}"
        onClick="${() => {
          setVertical(item.value);
          // add small delay to allow user to see selection before menu closes
          setTimeout(() => {
            setIsMenuOpen(false);
          }, 250);

          // Dispatch custom event to notify other components
          document.dispatchEvent(
            new CustomEvent(`vis-2-vertical-changed`, {
              detail: { selectedVertical: item.value },
            })
          );
        }}"
      >
        <span>${item.label}</span>
      </li>`;
    });
  };

  return html`<div class="vis-filter-container">
    <div class="vis-filter-category-container">
      <div
        class=${`vis-filter-item ${category === "consumer" ? "selected" : ""}`}
        onclick=${() => handleCategoryChange("consumer")}
      >
        <p class="charts-text-big-bold">Consumer</p>
        <svg
          width="23"
          height="22"
          viewBox="0 0 23 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(${isMenuOpen && category === "consumer" ? 180 : 0})"
          style="transition: transform 0.3s ease;"
        >
          <circle cx="11.9265" cy="11" r="11" fill="white" />
          <path
            d="M7.23413 8.90234C7.34553 8.89042 7.45696 8.92688 7.54468 9.01758H7.54565L11.9421 13.04L16.3074 9.01758C16.3952 8.92652 16.5073 8.8904 16.6189 8.90234C16.73 8.91429 16.8347 8.97257 16.9148 9.05859C17.0046 9.15511 17.0345 9.28424 17.0242 9.40039C17.0141 9.51344 16.9637 9.62686 16.8748 9.70117L16.8757 9.70215L12.2107 14.002L12.2097 14.001C12.1763 14.0338 12.1287 14.0573 12.0896 14.0713C12.0452 14.0872 11.9915 14.0996 11.9431 14.0996C11.8947 14.0996 11.8415 14.088 11.7957 14.0732C11.7485 14.058 11.7016 14.0374 11.6628 14.0166L11.6511 14.0107L11.6423 14.002L6.97729 9.70215L6.97144 9.69727C6.8145 9.52852 6.75833 9.25203 6.93823 9.05859C7.01833 8.97257 7.12306 8.91429 7.23413 8.90234Z"
            stroke="#04033a"
            fill="#04033a"
            stroke-width="0.2"
          />
        </svg>
      </div>
      <div
        class=${`vis-filter-item ${category === "gaming" ? "selected" : ""}`}
        onclick=${() => handleCategoryChange("gaming")}
      >
        <p class="charts-text-big-bold">Gaming</p>
        <svg
          width="23"
          height="22"
          viewBox="0 0 23 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          transform="rotate(${isMenuOpen && category === "gaming" ? 180 : 0})"
          style="transition: transform 0.3s ease;"
        >
          <circle cx="11.9265" cy="11" r="11" fill="white" />
          <path
            d="M7.23413 8.90234C7.34553 8.89042 7.45696 8.92688 7.54468 9.01758H7.54565L11.9421 13.04L16.3074 9.01758C16.3952 8.92652 16.5073 8.8904 16.6189 8.90234C16.73 8.91429 16.8347 8.97257 16.9148 9.05859C17.0046 9.15511 17.0345 9.28424 17.0242 9.40039C17.0141 9.51344 16.9637 9.62686 16.8748 9.70117L16.8757 9.70215L12.2107 14.002L12.2097 14.001C12.1763 14.0338 12.1287 14.0573 12.0896 14.0713C12.0452 14.0872 11.9915 14.0996 11.9431 14.0996C11.8947 14.0996 11.8415 14.088 11.7957 14.0732C11.7485 14.058 11.7016 14.0374 11.6628 14.0166L11.6511 14.0107L11.6423 14.002L6.97729 9.70215L6.97144 9.69727C6.8145 9.52852 6.75833 9.25203 6.93823 9.05859C7.01833 8.97257 7.12306 8.91429 7.23413 8.90234Z"
            stroke="#04033a"
            fill="#04033a"
            stroke-width="0.2"
          />
        </svg>
      </div>

      ${isMenuOpen &&
      html` <div class="vis-filter-menu-container">
        <ul class="vertical-list">
          ${getVerticalItems()}
        </ul>
      </div>`}
    </div>
  </div>`;
}
