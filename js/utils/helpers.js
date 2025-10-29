export const REPO_BASE_URL =
  "https://raw.githubusercontent.com/parabolestudio/molocoreengagement/refs/heads/main/";

export function populateCountrySelectors(countries, containerId) {
  const countryLabels = {
    AUS: "Australia",
    BRA: "Brazil",
    CAN: "Canada",
    FRA: "France",
    DEU: "Germany",
    WW: "Global",
    IDN: "Indonesia",
    IND: "India",
    JPN: "Japan",
    KOR: "South Korea",
    GBR: "U.K.",
    USA: "U.S.",
  };

  const countriesArray = countries
    .map((country) => ({
      value: country,
      text: countryLabels[country] || country,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));

  const countryDefault = { value: "USA", text: "U.S." };

  const dropdown = document.querySelector(containerId);
  if (dropdown) {
    dropdown.innerHTML = "";
    countriesArray.forEach((country) => {
      let option = document.createElement("option");
      option.value = country.value;
      option.text = country.text;
      dropdown.add(option);
    });
    dropdown.value = countryDefault.value;
    dropdown.addEventListener("change", (e) => {
      document.dispatchEvent(
        new CustomEvent(`${containerId}-changed`, {
          detail: { selected: e.target.value },
        })
      );
    });
  }
}

export const verticalsMap = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Match",
    value: "match",
  },
  {
    label: "Casino",
    value: "casino",
  },
  {
    label: "Puzzle",
    value: "puzzle",
  },
  {
    label: "RPG",
    value: "rpg",
  },
  {
    label: "Simulation",
    value: "simulation",
  },
  {
    label: "Strategy",
    value: "strategy",
  },
  {
    label: "Tabletop",
    value: "tabletop",
  },

  {
    label: "All",
    value: "all",
  },
  {
    label: "E-commerce",
    value: "e-commerce",
  },
  {
    label: "RMG",
    value: "rmg",
  },
  {
    label: "Social",
    value: "social",
  },
  {
    label: "Trading & Investing",
    value: "finance (trading & investing)",
  },
  {
    label: "Finance & Banking",
    value: "finance (financial health & banking)",
  },
  {
    label: "Utility & Productivity",
    value: "utility & productivity",
  },
  {
    label: "Food & Delivery",
    value: "on-demand",
  },
  {
    label: "Dating",
    value: "dating",
  },
  {
    label: "Entertainment",
    value: "entertainment",
  },
  {
    label: "Travel",
    value: "travel",
  },
  {
    label: "Health & Fitness",
    value: "health & fitness",
  },
  {
    label: "Education",
    value: "education",
  },
  {
    label: "News",
    value: "news",
  },
  {
    label: "Loyalty",
    value: "loyalty",
  },
  {
    label: "Gen AI",
    value: "generative ai",
  },
  {
    label: "Other",
    value: "other consumer",
  },
  {
    label: "Other",
    value: "other gaming",
  },
  {
    label: "Hypercasual",
    value: "hypercasual",
  },
  {
    label: "MidCore",
    value: "midcore",
  },
];
