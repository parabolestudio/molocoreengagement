export const REPO_BASE_URL =
  "https://raw.githubusercontent.com/parabolestudio/molocoreengagement/refs/heads/main/";

export const isMobile = window.innerWidth <= 480;

export const countryLabels = {
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
  TUR: "Turkey",
  ARG: "Argentina",
  MEX: "Mexico",
  VNM: "Vietnam",
};

export function populateCountrySelectors(countries, containerId, locale) {
  const countriesArray = countries
    .map((country) => ({
      value: country,
      text:
        COUNTRIES.find((c) => c["Country Code"] === country)?.[locale] ||
        country,
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
        }),
      );
    });
  }
}

export function formatText(text) {
  if (text === "rmg") return "RMG";

  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

export function getDataURL(filename, locale) {
  let baseURL = "";
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    baseURL = "./data";
  } else {
    baseURL = REPO_BASE_URL + "data";
  }

  let localeEnding = "";
  if (locale === "en") {
    localeEnding = "";
  } else if (locale === "zh") {
    localeEnding = "-zh";
  } else if (locale === "ko") {
    localeEnding = "-ko";
  } else if (locale === "ja") {
    localeEnding = "-ja";
  }
  return `${baseURL}/${filename}${localeEnding}.csv`;
}

export const getLocale = () => {
  const locales = ["zh", "ko", "ja", "en"];
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("moloco-dev")
  ) {
    console.log("Running in local testing mode");
    // local testing with ?testLocale=zh or ko or ja or en
    const param = new URLSearchParams(window.location.search).get("testLocale");
    if (locales.includes(param)) return param;
  } else {
    // production - determine locale from path
    console.log("Running in production mode");
    const urlPath = window.location.pathname;
    for (const locale of locales) {
      if (urlPath.includes(`/${locale}/`)) return locale;
    }
  }
  // default to English if no locale found in path
  return "en";
};

const COUNTRIES = [
  {
    "Country Code": "USA",
    en: "U.S.",
    ko: "미국",
    ja: "アメリカ合衆国",
    zh: "美国",
  },
  {
    "Country Code": "JPN",
    en: "Japan",
    ko: "일본",
    ja: "日本",
    zh: "日本",
  },
  {
    "Country Code": "GBR",
    en: "U.K.",
    ko: "영국",
    ja: "イギリス",
    zh: "英国",
  },
  {
    "Country Code": "DEU",
    en: "Germany",
    ko: "독일",
    ja: "ドイツ",
    zh: "德国",
  },
  {
    "Country Code": "CAN",
    en: "Canada",
    ko: "캐나다",
    ja: "カナダ",
    zh: "加拿大",
  },
  {
    "Country Code": "AUS",
    en: "Australia",
    ko: "호주",
    ja: "オーストラリア",
    zh: "澳大利亚",
  },
  {
    "Country Code": "KOR",
    en: "South Korea",
    ko: "대한민국",
    ja: "韓国",
    zh: "韩国",
  },
  {
    "Country Code": "FRA",
    en: "France",
    ko: "프랑스",
    ja: "フランス",
    zh: "法国",
  },
  {
    "Country Code": "BRA",
    en: "Brazil",
    ko: "브라질",
    ja: "ブラジル",
    zh: "巴西",
  },
  {
    "Country Code": "MEX",
    en: "Mexico",
    ko: "멕시코",
    ja: "メキシコ",
    zh: "墨西哥",
  },
  {
    "Country Code": "IND",
    en: "India",
    ko: "인도",
    ja: "インド",
    zh: "印度",
  },
  {
    "Country Code": "IDN",
    en: "Indonesia",
    ko: "인도네시아",
    ja: "インドネシア",
    zh: "印度尼西亚",
  },
  {
    "Country Code": "VNM",
    en: "Vietnam",
    ko: "베트남",
    ja: "ベトナム",
    zh: "越南",
  },
  {
    "Country Code": "All countries",
    en: "All countries",
    ko: "모든 국가",
    ja: "すべての国",
    zh: "中国台湾/中国香港",
  },
  {
    "Country Code": "RUS",
    en: "Russia",
    ko: "러시아",
    ja: "ロシア",
    zh: "俄罗斯",
  },
  {
    "Country Code": "TUR",
    en: "Turkey",
    ko: "터키",
    ja: "トルコ",
    zh: "土耳其",
  },
  {
    "Country Code": "PHL",
    en: "Philippines",
    ko: "필리핀",
    ja: "フィリピン",
    zh: "菲律宾",
  },
  {
    "Country Code": "PAK",
    en: "Pakistan",
    ko: "파키스탄",
    ja: "パキスタン",
    zh: "巴基斯坦",
  },
  {
    "Country Code": "NGA",
    en: "Nigeria",
    ko: "나이지리아",
    ja: "ナイジェリア",
    zh: "尼日利亚",
  },
  {
    "Country Code": "EGY",
    en: "Egypt",
    ko: "이집트",
    ja: "エジプト",
    zh: "埃及",
  },
  {
    "Country Code": "THA",
    en: "Thailand",
    ko: "태국",
    ja: "タイ",
    zh: "泰国",
  },
  {
    "Country Code": "ITA",
    en: "Italy",
    ko: "이탈리아",
    ja: "イタリア",
    zh: "意大利",
  },
  {
    "Country Code": "COL",
    en: "Colombia",
    ko: "콜롬비아",
    ja: "コロンビア",
    zh: "哥伦比亚",
  },
  {
    "Country Code": "ESP",
    en: "Spain",
    ko: "스페인",
    ja: "スペイン",
    zh: "西班牙",
  },
  {
    "Country Code": "ARG",
    en: "Argentina",
    ko: "아르헨티나",
    ja: "アルゼンチン",
    zh: "阿根廷",
  },
  {
    "Country Code": "MYS",
    en: "Malaysia",
    ko: "말레이시아",
    ja: "マレーシア",
    zh: "马来西亚",
  },
  {
    "Country Code": "SAU",
    en: "Saudi Arabia",
    ko: "사우디아라비아",
    ja: "サウジアラビア",
    zh: "沙特阿拉伯",
  },
  {
    "Country Code": "PER",
    en: "Peru",
    ko: "페루",
    ja: "ペルー",
    zh: "秘鲁",
  },
  {
    "Country Code": "ZAF",
    en: "South Africa",
    ko: "남아프리카공화국",
    ja: "南アフリカ",
    zh: "南非",
  },
  {
    "Country Code": "DZA",
    en: "Algeria",
    ko: "알제리",
    ja: "アルジェリア",
    zh: "阿尔及利亚",
  },
  {
    "Country Code": "UKR",
    en: "Ukraine",
    ko: "우크라이나",
    ja: "ウクライナ",
    zh: "乌克兰",
  },
  {
    "Country Code": "VEN",
    en: "Venezuela",
    ko: "베네수엘라",
    ja: "ベネズエラ",
    zh: "委内瑞拉",
  },
  {
    "Country Code": "POL",
    en: "Poland",
    ko: "폴란드",
    ja: "ポーランド",
    zh: "波兰",
  },
  {
    "Country Code": "CHL",
    en: "Chile",
    ko: "칠레",
    ja: "チリ",
    zh: "智利",
  },
  {
    "Country Code": "KAZ",
    en: "Kazakhstan",
    ko: "카자흐스탄",
    ja: "カザフスタン",
    zh: "哈萨克斯坦",
  },
  {
    "Country Code": "TWN",
    en: "Taiwan",
    ko: "대만",
    ja: "台湾",
    zh: "中国台湾",
  },
  {
    "Country Code": "UZB",
    en: "Uzbekistan",
    ko: "우즈베키스탄",
    ja: "ウズベキスタン",
    zh: "乌兹别克斯坦",
  },
  {
    "Country Code": "ECU",
    en: "Ecuador",
    ko: "에콰도르",
    ja: "エクアドル",
    zh: "厄瓜多尔",
  },
  {
    "Country Code": "KEN",
    en: "Kenya",
    ko: "케냐",
    ja: "ケニア",
    zh: "肯尼亚",
  },
  {
    "Country Code": "LKA",
    en: "Sri Lanka",
    ko: "스리랑카",
    ja: "スリランカ",
    zh: "斯里兰卡",
  },
  {
    "Country Code": "GHA",
    en: "Ghana",
    ko: "가나",
    ja: "ガーナ",
    zh: "加纳",
  },
  {
    "Country Code": "NLD",
    en: "Netherlands",
    ko: "네덜란드",
    ja: "オランダ",
    zh: "荷兰",
  },
  {
    "Country Code": "ROU",
    en: "Romania",
    ko: "루마니아",
    ja: "ルーマニア",
    zh: "罗马尼亚",
  },
  {
    "Country Code": "ARE",
    en: "UAE",
    ko: "아랍에미리트",
    ja: "アラブ首長国連邦",
    zh: "阿拉伯联合酋长国",
  },
  {
    "Country Code": "DOM",
    en: "Dominican Republic",
    ko: "도미니카공화국",
    ja: "ドミニカ共和国",
    zh: "多米尼加共和国",
  },
  {
    "Country Code": "GTM",
    en: "Guatemala",
    ko: "과테말라",
    ja: "グアテマラ",
    zh: "危地马拉",
  },
  {
    "Country Code": "AZE",
    en: "Azerbaijan",
    ko: "아제르바이잔",
    ja: "アゼルバイジャン",
    zh: "阿塞拜疆",
  },
  {
    "Country Code": "ISR",
    en: "Israel",
    ko: "이스라엘",
    ja: "イスラエル",
    zh: "以色列",
  },
  {
    "Country Code": "TUN",
    en: "Tunisia",
    ko: "튀니지",
    ja: "チュニジア",
    zh: "突尼斯",
  },
  {
    "Country Code": "PRT",
    en: "Portugal",
    ko: "포르투갈",
    ja: "ポルトガル",
    zh: "葡萄牙",
  },
  {
    "Country Code": "BEL",
    en: "Belgium",
    ko: "벨기에",
    ja: "ベルギー",
    zh: "比利时",
  },
  {
    "Country Code": "LBN",
    en: "Lebanon",
    ko: "레바논",
    ja: "レバノン",
    zh: "黎巴嫩",
  },
  {
    "Country Code": "SWE",
    en: "Sweden",
    ko: "스웨덴",
    ja: "スウェーデン",
    zh: "瑞典",
  },
  {
    "Country Code": "GRC",
    en: "Greece",
    ko: "그리스",
    ja: "ギリシャ",
    zh: "希腊",
  },
  {
    "Country Code": "CZE",
    en: "Czechia",
    ko: "체코",
    ja: "チェコ",
    zh: "捷克",
  },
  {
    "Country Code": "BLR",
    en: "Belarus",
    ko: "벨라루스",
    ja: "ベラルーシ",
    zh: "白俄罗斯",
  },
  {
    "Country Code": "HUN",
    en: "Hungary",
    ko: "헝가리",
    ja: "ハンガリー",
    zh: "匈牙利",
  },
  {
    "Country Code": "HKG",
    en: "Hong Kong SAR",
    ko: "홍콩 특별행정구",
    ja: "香港特別行政区",
    zh: "中国香港",
  },
  {
    "Country Code": "CRI",
    en: "Costa Rica",
    ko: "코스타리카",
    ja: "コスタリカ",
    zh: "哥斯达黎加",
  },
  {
    "Country Code": "SGP",
    en: "Singapore",
    ko: "싱가포르",
    ja: "シンガポール",
    zh: "新加坡",
  },
  {
    "Country Code": "SLV",
    en: "El Salvador",
    ko: "엘살바도르",
    ja: "エルサルバドル",
    zh: "萨尔瓦多",
  },
  {
    "Country Code": "OMN",
    en: "Oman",
    ko: "오만",
    ja: "オマーン",
    zh: "阿曼",
  },
  {
    "Country Code": "CHE",
    en: "Switzerland",
    ko: "스위스",
    ja: "スイス",
    zh: "瑞士",
  },
  {
    "Country Code": "KWT",
    en: "Kuwait",
    ko: "쿠웨이트",
    ja: "クウェート",
    zh: "科威特",
  },
  {
    "Country Code": "AUT",
    en: "Austria",
    ko: "오스트리아",
    ja: "オーストリア",
    zh: "奥地利",
  },
  {
    "Country Code": "BGR",
    en: "Bulgaria",
    ko: "불가리아",
    ja: "ブルガリア",
    zh: "保加利亚",
  },
  {
    "Country Code": "IRL",
    en: "Ireland",
    ko: "아일랜드",
    ja: "アイルランド",
    zh: "爱尔兰",
  },
  {
    "Country Code": "PAN",
    en: "Panama",
    ko: "파나마",
    ja: "パナマ",
    zh: "巴拿马",
  },
  {
    "Country Code": "NZL",
    en: "New Zealand",
    ko: "뉴질랜드",
    ja: "ニュージーランド",
    zh: "新西兰",
  },
  {
    "Country Code": "FIN",
    en: "Finland",
    ko: "핀란드",
    ja: "フィンランド",
    zh: "芬兰",
  },
  {
    "Country Code": "DNK",
    en: "Denmark",
    ko: "덴마크",
    ja: "デンマーク",
    zh: "丹麦",
  },
  {
    "Country Code": "URY",
    en: "Uruguay",
    ko: "우루과이",
    ja: "ウルグアイ",
    zh: "乌拉圭",
  },
  {
    "Country Code": "NOR",
    en: "Norway",
    ko: "노르웨이",
    ja: "ノルウェー",
    zh: "挪威",
  },
  {
    "Country Code": "QAT",
    en: "Qatar",
    ko: "카타르",
    ja: "カタール",
    zh: "卡塔尔",
  },
  {
    "Country Code": "HRV",
    en: "Croatia",
    ko: "크로아티아",
    ja: "クロアチア",
    zh: "克罗地亚",
  },
  {
    "Country Code": "SVK",
    en: "Slovakia",
    ko: "슬로바키아",
    ja: "スロバキア",
    zh: "斯洛伐克",
  },
  {
    "Country Code": "LTU",
    en: "Lithuania",
    ko: "리투아니아",
    ja: "リトアニア",
    zh: "立陶宛",
  },
  {
    "Country Code": "SVN",
    en: "Slovenia",
    ko: "슬로베니아",
    ja: "スロベニア",
    zh: "斯洛文尼亚",
  },
  {
    "Country Code": "AGO",
    en: "Angola",
    ko: "앙골라",
    ja: "アンゴラ",
    zh: "安哥拉",
  },
  {
    "Country Code": "LUX",
    en: "Luxembourg",
    ko: "룩셈부르크",
    ja: "ルクセンブルク",
    zh: "卢森堡",
  },
  {
    "Country Code": "MDG",
    en: "Madagascar",
    ko: "마다가스카르",
    ja: "マダガスカル",
    zh: "马达加斯加",
  },
  {
    "Country Code": "BRB",
    en: "Barbados",
    ko: "바베이도스",
    ja: "バルバドス",
    zh: "巴巴多斯",
  },
  {
    "Country Code": "BMU",
    en: "Bermuda",
    ko: "버뮤다",
    ja: "バミューダ",
    zh: "百慕大",
  },
  {
    "Country Code": "Australia",
    en: "AUS",
    ko: "AUS",
    ja: "AUS",
    zh: "澳大利亚",
  },
  {
    "Country Code": "Brazil",
    en: "BRA",
    ko: "BRA",
    ja: "BRA",
    zh: "巴西",
  },
  {
    "Country Code": "Canada",
    en: "CAN",
    ko: "CAN",
    ja: "CAN",
    zh: "加拿大",
  },
  {
    "Country Code": "Germany",
    en: "DEU",
    ko: "DEU",
    ja: "DEU",
    zh: "德国",
  },
  {
    "Country Code": "France",
    en: "FRA",
    ko: "FRA",
    ja: "FRA",
    zh: "法国",
  },
  {
    "Country Code": "South Korea",
    en: "KOR",
    ko: "KOR",
    ja: "KOR",
    zh: "韩国",
  },
  {
    "Country Code": "Japan",
    en: "JPN",
    ko: "JPN",
    ja: "JPN",
    zh: "日本",
  },
  {
    "Country Code": "U.S.",
    en: "USA",
    ko: "USA",
    ja: "USA",
    zh: "美国",
  },
  {
    "Country Code": "Vietnam",
    en: "VNM",
    ko: "VNM",
    ja: "VNM",
    zh: "越南",
  },
  {
    "Country Code": "Indonesia",
    en: "IDN",
    ko: "IDN",
    ja: "IDN",
    zh: "印度尼西亚",
  },
  {
    "Country Code": "U.K.",
    en: "GBR",
    ko: "GBR",
    ja: "GBR",
    zh: "英国",
  },
  {
    "Country Code": "Mexico",
    en: "MEX",
    ko: "MEX",
    ja: "MEX",
    zh: "墨西哥",
  },
  {
    "Country Code": "India",
    en: "IND",
    ko: "IND",
    ja: "IND",
    zh: "印度",
  },
];
