let charts = null;
let days = null;
const chartHeader = document.querySelector('.revenue-period');
async function fetchData() {
  try {
    const accessToken = localStorage.getItem('access_token');
    let response = await fetch('https://freddy.codesubmit.io/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let data = await response.json();
    const cardOrders = data.dashboard.sales_over_time_week;
    console.log(data);
    charts = data.dashboard;
    days = [
      { label: 'today' },
      { label: 'yesterday' },
      { label: 'day 3' },
      { label: 'day 4' },
      { label: 'day 5' },
      { label: 'day 6' },
      { label: 'day 7' },
    ];
    chartHeader.textContent = 'Revenue (last 7 days)';
    chartOrder(cardOrders, days);
    dashboardData(cardOrders);
    bestSellers(data.dashboard.bestsellers);
  } catch (error) {
    const refreshToken = localStorage.getItem('refresh_token');
    console.error(error);
    let response = await fetch('https://freddy.codesubmit.io/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
        // body: refreshToken,
      },
    });
    localStorage.removeItem('access_token');
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    console.log('from backend', data);
    // location.reload();
  }
}

fetchData();

function bestSellers(sellers) {
  const productName = document.querySelector('.product-list');
  const priceList = document.querySelector('.price-list');
  const unitList = document.querySelector('.unit-list');

  for (let i = 0; i < sellers.length; i++) {
    let li = document.createElement('li');
    let priceLi = document.createElement('li');
    let unitLi = document.createElement('li');
    li.textContent = sellers[i].product.name;
    productName.appendChild(li);
    priceLi.textContent = sellers[i].revenue;
    unitLi.textContent = sellers[i].units;
    priceList.appendChild(priceLi);
    unitList.appendChild(unitLi);

    // priceList.appendChild(priceLi);
  }
}

function dashboardData(data) {
  console.log(data);
  const todayContent = Object.values(data)[0];
  const weekContent = Object.values(data)[1];
  const monthContent = Object.values(data)[2];
  const TodayOrder = document.querySelector('.today-order');
  const WeekOrder = document.querySelector('.week-order');
  const monthOrder = document.querySelector('.month-order');

  TodayOrder.textContent = `$${todayContent.total} / ${todayContent.orders} orders`;
  WeekOrder.textContent = `$${weekContent.total} / ${weekContent.orders} orders`;
  monthOrder.textContent = `$${monthContent.total} / ${monthContent.orders} orders`;
}

const hideBtnText = document.querySelector('.hideLogin');
hideBtnText.style.display = 'none';

function getChartFlow() {
  const chartToggle = document.querySelector('.input-check').checked;

  if (chartToggle == true) {
    chartOrder(charts.sales_over_time_week, days);
    chartHeader.textContent = 'Revenue (last 7 days)';
  } else {
    const months = [
      { label: 'this month' },
      { label: 'last month' },
      { label: 'month 3' },
      { label: 'month 4' },
      { label: 'month 5' },
      { label: 'month 6' },
      { label: 'month 7' },
      { label: 'month 8' },
      { label: 'month 9' },
      { label: 'month 10' },
      { label: 'month 11' },
      { label: 'month 12' },
    ];
    chartHeader.textContent = 'Revenue (last 12 months)';
    chartOrder(charts.sales_over_time_year, months);
  }
  // console.log(chartToggle.checked);
}

async function submitLogin(e) {
  e.preventDefault();
  const loginBtnText = document.querySelector('.showLogin');

  loginBtnText.style.display = 'none';
  hideBtnText.style.display = 'block';

  const username = document.querySelector('.user-name').value;
  const password = document.querySelector('.password').value;

  if (username === 'freddy' && password === 'ElmStreet2019') {
    const loginResponse = await fetch(`https://freddy.codesubmit.io/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    console.log('raw resosne', loginResponse);
    const data = await loginResponse.json();
    console.log(data);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('access_token', data.access_token);
    location.pathname = '/public/index.html';
  } else {
    const errorElement = document.querySelector('.error-message');
    loginBtnText.style.display = 'block';
    hideBtnText.style.display = 'none';

    errorElement.textContent = 'Incorrect user name or password';
  }
}

function chartOrder(orderPeriod, days) {
  let newObj = Object.values(orderPeriod).map(function (el) {
    return { y: el.total };
  });
  let weeklyData = days.map((item, i) => Object.assign({}, item, newObj[i]));
  console.log(weeklyData);

  var chart = new CanvasJS.Chart('chartContainer', {
    animationEnabled: true,
    theme: 'light2', // "light1", "light2", "dark1", "dark2"
    //   title: {
    //     text: 'Top Oil Reserves',
    //   },
    //   axisY: {
    //     title: 'Reserves(MMbbl)',
    //   },
    data: [
      {
        type: 'column',
        showInLegend: true,
        legendMarkerColor: 'grey',
        //   legendText: 'MMbbl = one million barrels',
        dataPoints: weeklyData,
      },
    ],
  });
  chart.render();
}

function logout() {
  localStorage.removeItem('access_token');
  location.pathname = '/public/login.html';
}
