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
} from "./utils/helpers.js";

export function Vis2() {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState("USA");
  const [category, setCategory] = useState("consumer");
  const [vertical, setVertical] = useState("all");

  useEffect(() => {
    // Fetch data when the component mounts
    d3.csv(
      `${REPO_BASE_URL}/data/vis2_data.csv`
      //   `./data/vis2_data.csv`
    ).then((fetchedData) => {
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
      });

      setData(fetchedData);

      const uniqueCountries = Array.from(
        new Set(fetchedData.map((d) => d.country))
      );
      populateCountrySelectors(uniqueCountries, "#vis-2-dropdown-countries");

      // get unique verticals for gaming and consumer category
      const gamingVerticals = Array.from(
        new Set(
          fetchedData
            .filter((d) => d.category === "gaming")
            .map((d) => d.vertical)
        )
      );
      const consumerVerticals = Array.from(
        new Set(
          fetchedData
            .filter((d) => d.category === "consumer")
            .map((d) => d.vertical)
        )
      );
      console.log("Gaming verticals:", gamingVerticals);
      console.log("Consumer verticals:", consumerVerticals);
      renderVerticalSelector(gamingVerticals, consumerVerticals);
    });
  }, []);

  console.log("Vis2 data:", data);

  if (!data) {
    return html`<div>Loading...</div>`;
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

  console.log("Render in Vis2:", country, category, vertical, data);

  return html`<div>Vis2 here</div>`;
}

export function renderVerticalSelector(gamingVerticals, consumerVerticals) {
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
  const [category, setCategory] = useState("consumer");
  const [vertical, setVertical] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleCategoryChange(newCategory) {
    if (newCategory !== category) {
      console.log("Changing category to:", newCategory);
      setCategory(newCategory);

      console.log("Resetting vertical to 'all'");
      setVertical("all");

      // Open the menu
      setIsMenuOpen(true);

      // Dispatch custom event to notify other components
      document.dispatchEvent(
        new CustomEvent(`vis-2-category-changed`, {
          detail: { selectedCategory: newCategory },
        })
      );
      document.dispatchEvent(
        new CustomEvent(`vis-2-vertical-changed`, {
          detail: { selectedVertical: "all" },
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

  console.log(gamingVerticals, consumerVerticals);

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
        // keep "all" at the top
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
          <circle
            cx="11.9265"
            cy="11"
            r="11"
            fill="${category === "consumer" ? "white" : "#04033a"}"
          />
          <path
            d="M7.23413 8.90234C7.34553 8.89042 7.45696 8.92688 7.54468 9.01758H7.54565L11.9421 13.04L16.3074 9.01758C16.3952 8.92652 16.5073 8.8904 16.6189 8.90234C16.73 8.91429 16.8347 8.97257 16.9148 9.05859C17.0046 9.15511 17.0345 9.28424 17.0242 9.40039C17.0141 9.51344 16.9637 9.62686 16.8748 9.70117L16.8757 9.70215L12.2107 14.002L12.2097 14.001C12.1763 14.0338 12.1287 14.0573 12.0896 14.0713C12.0452 14.0872 11.9915 14.0996 11.9431 14.0996C11.8947 14.0996 11.8415 14.088 11.7957 14.0732C11.7485 14.058 11.7016 14.0374 11.6628 14.0166L11.6511 14.0107L11.6423 14.002L6.97729 9.70215L6.97144 9.69727C6.8145 9.52852 6.75833 9.25203 6.93823 9.05859C7.01833 8.97257 7.12306 8.91429 7.23413 8.90234Z"
            stroke="${category === "consumer" ? "#04033a" : "white"}"
            fill="${category === "consumer" ? "#04033a" : "white"}"
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
          <circle
            cx="11.9265"
            cy="11"
            r="11"
            fill="${category === "gaming" ? "white" : "#04033a"}"
          />
          <path
            d="M7.23413 8.90234C7.34553 8.89042 7.45696 8.92688 7.54468 9.01758H7.54565L11.9421 13.04L16.3074 9.01758C16.3952 8.92652 16.5073 8.8904 16.6189 8.90234C16.73 8.91429 16.8347 8.97257 16.9148 9.05859C17.0046 9.15511 17.0345 9.28424 17.0242 9.40039C17.0141 9.51344 16.9637 9.62686 16.8748 9.70117L16.8757 9.70215L12.2107 14.002L12.2097 14.001C12.1763 14.0338 12.1287 14.0573 12.0896 14.0713C12.0452 14.0872 11.9915 14.0996 11.9431 14.0996C11.8947 14.0996 11.8415 14.088 11.7957 14.0732C11.7485 14.058 11.7016 14.0374 11.6628 14.0166L11.6511 14.0107L11.6423 14.002L6.97729 9.70215L6.97144 9.69727C6.8145 9.52852 6.75833 9.25203 6.93823 9.05859C7.01833 8.97257 7.12306 8.91429 7.23413 8.90234Z"
            stroke="${category === "gaming" ? "#04033a" : "white"}"
            fill="${category === "gaming" ? "#04033a" : "white"}"
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
