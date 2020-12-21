const btn = window.document.querySelector(".searchBtn");
const searchBar = window.document.querySelector(".search-bar");
const card = window.document.querySelector(".main");
const matchContainer = window.document.querySelector(".matchContainer");
let matches = [];

//Countries API
const curl = "https://restcountries.eu/rest/v2/";

//Weather API
const wurl = "http://api.openweathermap.org/data/2.5/weather?";
const apiKey = "appid=804175cc7324c33db31ee45367377a33";
let lat;
let lon;

//Radio API
const rurl =
  "https://radio-world-50-000-radios-stations.p.rapidapi.com/v1/radios/getTopByCountry?query=";

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

//ask for current location
(function getGeoLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      getByLocation(lat, lon);
    });
  } else {
    card.innerHTML = "<h3 class='text-center'><i>Search for a country</i></h3>";
  }
})();

//fetch with coordinates and country
async function getByLocation(lat, lon) {
  try {
    let resp1 = await fetch(
      `${wurl}lat=${lat}&lon=${lon}&units=metric&${apiKey}`
    );
    let weatherData = await resp1.json();

    let resp2 = await fetch(`${curl}alpha/${weatherData.sys.country}`);
    let countryData = await resp2.json();

    renderToCard({ ...weatherData, ...countryData });
  } catch (err) {
    console.log(err);
  }
}

//fetching by search
async function fetchBySearch() {
  try {
    //searching for india returns an array with two countries
    if (searchBar.value === "india" || searchBar.value === "India") {
      let resp1 = await fetch(`${curl}name/${searchBar.value}`);
      let countryData = await resp1.json();
      countryData.splice(0, 1);
      let resp2 = await fetch(
        `${wurl}q=${countryData[0].capital.toLowerCase()}&units=metric&${apiKey}`
      );
      let weatherData = await resp2.json();
      renderToCard({ ...weatherData, ...countryData[0] });
      matches = [];
      matchContainer.innerHTML = "";
      return;
    }
    if (searchBar.value.length > 0) {
      let resp1 = await fetch(`${curl}name/${searchBar.value}`);
      let countryData = await resp1.json();
      console.log(countryData);
      let resp2 = await fetch(
        `${wurl}q=${countryData[0].capital.toLowerCase()}&units=metric&${apiKey}`
      );
      let weatherData = await resp2.json();
      renderToCard({ ...weatherData, ...countryData[0] });
      matches = [];
      matchContainer.innerHTML = "";
    }
  } catch (err) {
    console.log(err);
    card.innerHTML =
      "<h3 class='text-center'><i>Not a valid country, Search again...</i></h3>";
    matches = [];
    matchContainer.innerHTML = "";
  }
}

async function fetchBySelect(selectOption) {
  let name = selectOption.getAttribute("id");
  let resp = await fetch(`${curl}name/${name}`);
  let countryData = await resp.json();
  let resp2 = await fetch(
    `${wurl}q=${countryData[0].capital.toLowerCase()}&units=metric&${apiKey}`
  );
  let weatherData = await resp2.json();
  renderToCard({ ...weatherData, ...countryData[0] });
}

async function fetchAll(searchText) {
  const resp = await fetch(`${curl}all`);
  const countries = await resp.json();

  matches = countries.filter((country) => {
    const regex = new RegExp(`^${searchText}`, "gi");
    return country.name.match(regex) || country.alpha2Code.match(regex);
  });
  if (searchText.length === 0) {
    matches = [];
    matchContainer.innerHTML = "";
  }
  displayMatches(matches);
}

const displayMatches = (matches) => {
  if (matches.length > 0) {
    const html = matches
      .map((match) => {
        const regex = new RegExp(`^${searchBar.value}`, "gi");
        const countryName = match.name.replace(
          regex,
          `<span class="hl">${searchBar.value}</span>`
        );
        return `<div class="matchOption" id="${match.name}">
        ${countryName} |(${match.alpha2Code})
        ${match.capital}</div>`;
      })
      .join("");
    matchContainer.innerHTML = html;
    window.document.querySelectorAll("div.matchOption").forEach((option) =>
      option.addEventListener("click", (e) => {
        fetchBySelect(e.target);
        matches = [];
        matchContainer.innerHTML = "";
        searchBar.value = "";
      })
    );
  }
};

const renderToCard = (obj) => {
  console.clear();
  console.log(obj);
  const {
    flag,
    weather,
    main,
    name,
    sys,
    nativeName,
    alpha2Code,
    alpha3Code,
    capital,
    region,
    clouds,
    wind,
    dt,
    currencies,
    population,
  } = obj;

  card.innerHTML = `<div class="col-lg-6 col-md-8 col-sm-10">
           <div class="card container">
              <div class="row">
                <div class="col-7 country">
                  <h1 class="card-title my-2 ">${name} | ${nativeName}</h1>
                  <img class="card-img-top my-4 w-75" src=${flag} alt="">
                  <ul class="">
                    <li>Capital: ${capital}</li>
                    <li>Continent: ${region}</li>
                    <li>Currency: ${currencies[0].code} ${
    currencies[0].symbol
  }</li>
                    <li>Population: ${formatNumber(population)}</li>
                  </ul>
                  <a href="https://en.wikipedia.org/wiki/${name}" class="btn btn-primary my-2"  target="_blank">Check in Wikpedia</a>
                </div>
                <div class="weather col h-75 mb-5 mt-auto">
                  <h5 class="my-2">Weather</h5>
                  <h3 class="mt-4 mb-2">${Math.floor(main.temp)}&deg C</h3>
                  <img  src="http://openweathermap.org/img/wn/${
                    weather[0].icon
                  }@2x.png" alt="">
                  <h4 class="mt-2 mb-4"><i>${weather[0].description}</i></h4>
                  <ul class=" text-bottom">
                    <li>Cloudiness: ${clouds.all}%</li>
                    <li>Wind speed: ${wind.speed} m/s</li>
                    <li>Wind direction: ${wind.deg}&deg</li>
                    <li>Update time: ${new Date(dt * 1000).toLocaleString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "numeric",
                      }
                    )}</li>
                  </ul>
                </div>
              </div>
           </div>
          </div>
    `;
};

btn.addEventListener("click", () => {
  fetchBySearch();
  searchBar.value = "";
});

searchBar.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    fetchBySearch();
    searchBar.value = "";
  }
});
searchBar.addEventListener("input", () => fetchAll(searchBar.value));
