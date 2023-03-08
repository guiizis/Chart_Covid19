let countriesData = [];
let countries = [];
let apiData = [];
let bar_chart;
const kpi_confirmed = document.getElementById('kpi_confirmed');
const kpi_deads = document.getElementById('kpi_deads');
const kpi_saved = document.getElementById('kpi_saved');
const date_start_bar = document.getElementById('date_start_bar');
const date_end_bar = document.getElementById('date_end_bar');
const country_bar = document.getElementById('country_bar');
const country_bar_info = document.getElementById('country_bar_info');
const btn_bar_apply = document.getElementById('btn_bar_apply');
const pizza = document.getElementById('pizza').getContext('2d');
const bar = document.getElementById('bar').getContext('2d');

document.addEventListener("DOMContentLoaded", async function (e) {
  await getData();
  setKpi();
  setPizza();
  setBar();
  loadCountriesCombo();

  btn_bar_apply.addEventListener('click', setBar)
});

async function getData() {
  await Promise.all([
    fetch('https://api.covid19api.com/summary').then(data => data.json()),
    fetch('https://api.covid19api.com/countries').then(data => data.json())
  ]).then(data => {
    [apiData, countries] = data;
    countriesData = sortHigher('TotalDeaths', apiData.Countries);
  })
}


function sortHigher(param, list) {
  return list.sort(function (a, b) {
    const x = b[param]; const y = a[param];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function setKpi() {
  kpi_confirmed.innerText = apiData.Global.TotalConfirmed.toLocaleString('pt-BR');
  kpi_deads.innerText = apiData.Global.TotalDeaths.toLocaleString('pt-BR');
  kpi_saved.innerText = apiData.Global.TotalRecovered.toLocaleString('pt-BR');
}

function setPizza() {
  const pizza_chart = new Chart(pizza, {
    type: 'pie',
    data: {
      labels: ['Total Confirmados', 'Total Mortos', 'Total Recuperados'],
      datasets: [
        {
          data: [apiData.Global.TotalConfirmed, apiData.Global.TotalDeaths, apiData.Global.TotalRecovered],
          backgroundColor: [
            '#ff6384',
            '#36a2eb',
            '#cc65fe'
          ]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Casos Distruibuidos'
        }
      }
    },
  });
}

async function setBar() {
  const data = await getBarChartData();
  if (bar_chart) {
    bar_chart.destroy()
  }
  bar_chart = new Chart(bar, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Casos Distruibuidos'
        }
      }
    },
  });
}

async function getBarChartData() {
  if (country_bar.value === "all") {
    const slicedArray = countriesData.slice(0, 10);
    const countriesNames = slicedArray.map(country => country.Country);
    const countriesDeaths = slicedArray.map(country => country.TotalDeaths);
    return {
      labels: countriesNames,
      datasets: [
        {
          label: 'Mortes',
          data: countriesDeaths,
          backgroundColor: ['#cc65fe']
        }
      ]
    }
  } else {
    const dateStart = date_start_bar.value;
    const dateEnd = date_end_bar.value;
    const countryBar = country_bar.value;
    const countryBarInfo = country_bar_info.value;
    const url = `https://api.covid19api.com/country/${countryBar}/status/${countryBarInfo}?from=${dateStart}T00:00:00Z&to=${dateEnd}T00:00:00Z`;
    const data = await fetch(url).then(data => data.json()).catch(e => console.log(e));
    const labels = data.map(info => info.Date.replace('T00:00:00Z', ''));
    const cases = data.map(info => info.Cases);

    return {
      labels: labels,
      datasets: [
        {
          label: country_bar_info.value === "deaths" ? "Mortos" : country_bar_info.value === "recovered" ? "Recuperados" : "Casos Confirmados",
          data: cases,
          backgroundColor: ['#cc65fe']
        }
      ]
    }
  }
}

function loadCountriesCombo() {
  countries.forEach(country => {
    const opt = document.createElement('option');
    opt.value = country.Slug;
    opt.innerHTML = country.Country;
    country_bar.appendChild(opt);
  });
}