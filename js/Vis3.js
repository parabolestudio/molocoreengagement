import { html, useState, useEffect } from "./utils/preact-htm.js";
import { REPO_BASE_URL } from "./utils/helpers.js";

export function Vis3() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data when the component mounts
    d3.csv(`${REPO_BASE_URL}/data/vis3_data.csv`).then((fetchedData) => {
      // fetchedData.forEach((d) => {
      // });

      setData(fetchedData);
    });
  }, []);

  if (!data) {
    return html`<div>Loading data...</div>`;
  }

  console.log("Rendering vis 3", { data });

  return html`<div>Vis3</div>`;
}
