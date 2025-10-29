import { html, useEffect, useState } from "./utils/preact-htm.js";
import { REPO_BASE_URL, populateCountrySelectors } from "./utils/helpers.js";

export function Vis2() {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState("USA");

  useEffect(() => {
    // Fetch data when the component mounts
    d3.csv(
      // `${REPO_BASE_URL}/data/vis2_data.csv`
      `./data/vis2_data.csv`
    ).then((fetchedData) => {
      fetchedData.forEach((d) => {
        d["inactivityDays"] = +d["inactivity_days"];
        d["returnPerc"] = +d["return_rate_percentage"];
      });

      setData(fetchedData);

      // get unique countries
      const uniqueCountries = Array.from(
        new Set(fetchedData.map((d) => d.country))
      );
      populateCountrySelectors(uniqueCountries, "#vis-2-dropdown-countries");
    });
  }, []);

  console.log("Vis2 data:", data);

  if (!data) {
    return html`<div>Loading...</div>`;
  }

  useEffect(() => {
    const handleCountryChange = (e) => {
      setCountry(e.detail.selected);
    };

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

  console.log("Selected country in Vis2:", country);

  return html`<div>Vis2 here</div>`;
}

// export function Vis2DropdownVerticals() {
//   return html`<div>Vis2DropdownVerticals here</div>`;
// }
