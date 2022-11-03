let charts = null;
let days = null;
const chartHeader = document.querySelector('.revenue-period');
const accessToken = localStorage.getItem('access_token');
let baseUrl = 'https://freddy.codesubmit.io';

async function login() {
  // e.preventDefault();

  console.log('login');
  const username = document.querySelector('.user-name').value;
  const password = document.querySelector('.password').value;

  if (username === 'freddy' && password === 'ElmStreet2019') {
    console.log(username, password);
    const loginResponse = await fetch(`${baseUrl}/login`, {
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

    errorElement.textContent = 'Incorrect user name or password';
  }
}
// fetching dashboard data
async function fetchData() {
  try {
    let response = await fetch(`${baseUrl}/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let data = await response.json();
    const cardOrders = data.dashboard.sales_over_time_week;
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
    console.error('error', error);

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
  }
}

function bestSellers(sellers) {
  const bestsellers = document.querySelector('.sellers-list');

  for (let i = 0; i < sellers.length; i++) {
    let li = document.createElement('li');
    let priceLi = document.createElement('li');
    let unitLi = document.createElement('li');
    li.textContent = sellers[i].product.name;
    li.classList.add = 'product-style';
    bestsellers.appendChild(li);
    priceLi.textContent = sellers[i].revenue;
    unitLi.textContent = sellers[i].units;
    bestsellers.appendChild(priceLi);
    bestsellers.appendChild(unitLi);

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

function chartOrder(orderPeriod, days) {
  let newObj = Object.values(orderPeriod).map(function (el) {
    return { y: el.total };
  });
  let weeklyData = days.map((item, i) => Object.assign({}, item, newObj[i]));

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

async function fetchOrders(pageNo, searchItem) {
  let searchBox = document.querySelector('#search-box');
  searchBox.style.display = 'none';
  const currentPageNo = document.querySelector('.currentPageNo');
  const totalPages = document.querySelector('.totalPages');

  let url = null;
  if (searchItem && pageNo > 1) {
    url = `${baseUrl}/orders?page=${pageNo}&q=${searchItem}`;
  } else if (searchItem) {
    url = `${baseUrl}/orders?page=${pageNo}&q=${searchItem}`;
  } else if (pageNo > 1) {
    url = `${baseUrl}/orders?page=${pageNo}`;
  } else {
    url = `${baseUrl}/orders`;
  }
  console.log(url);

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let data = await response.json();
    console.log(data);
    currentPageNo.textContent = data.page;
    totalPages.textContent = data.total / data.orders.length;

    orderList(data.orders);
  } catch (error) {
    console.error(error);
    const refreshToken = localStorage.getItem('refresh_token');
    console.error('error', error);

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
  }
}

function orderList(orders, searchInput) {
  const productOrder = document.querySelector('.product-order');
  const searchOrder = document.querySelector('.search-order');

  for (let i = 0; i < orders.length; i++) {
    let li = document.createElement('li');
    let priceLi = document.createElement('li');
    let unitLi = document.createElement('li');
    let statsLi = document.createElement('li');
    // setTimeout(() => {
    // li.style.display = 'none';
    // unitLi.style.display = 'none';
    // priceLi.style.display = 'none';
    // statsLi.style.display = 'none';
    // }, 1000);

    li.classList.add('li');

    priceLi.classList.add('li');

    unitLi.classList.add('li');

    statsLi.classList.add('li');
    li.textContent = orders[i].product.name;
    productOrder.appendChild(li);

    priceLi.textContent = `${orders[i].currency} ${orders[i].total}`;
    unitLi.textContent = orders[i].created_at.slice(0, 10);
    statsLi.textContent = orders[i].status;
    statsLi.textContent == 'processing'
      ? statsLi.classList.add('processing')
      : statsLi.textContent == 'delivered'
      ? statsLi.classList.add('delivered')
      : '';
    // li.style.display = 'block';
    // unitLi.style.display = 'block';
    // priceLi.style.display = 'block';
    // statsLi.style.display = 'block';
    productOrder.appendChild(priceLi);
    productOrder.appendChild(unitLi);
    productOrder.appendChild(statsLi);
    if (searchInput) {
      searchOrder.appendChild(li);
      searchOrder.appendChild(priceLi);
      searchOrder.appendChild(unitLi);
      searchOrder.appendChild(statsLi);
      console.log(searchOrder);
    }
  }
}

// order searchlist
function searchList() {
  let searchInput = document.querySelector('.search-input').value;
  searchInput = searchInput.toLowerCase();

  let currentPageNo = document.querySelector('.currentPageNo').textContent;
  const li = document.querySelectorAll('.li');
  console.log(currentPageNo, searchInput);

  fetchOrders(currentPageNo, searchInput);
  for (let i = 0; i < li.length; i++) {
    li[i].style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('access_token');
  location.pathname = '/public/login.html';
}

function toNextPage() {
  let currentPageNo = document.querySelector('.currentPageNo').textContent;
  let totalPages = document.querySelector('.totalPages').textContent;

  if (currentPageNo != totalPages) {
    const li = document.querySelectorAll('.li');
    console.log(currentPageNo);
    let newPageNo = parseInt(currentPageNo) + 1;

    fetchOrders(newPageNo);
    for (let i = 0; i < li.length; i++) {
      li[i].style.display = 'none';
    }
  }
}
