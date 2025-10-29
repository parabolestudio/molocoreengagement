export const REPO_BASE_URL =
  "https://raw.githubusercontent.com/parabole-studio/molocoreengagement/main/";

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
