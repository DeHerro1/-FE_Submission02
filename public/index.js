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
    dashboardData(cardOrders);
  } catch (error) {
    const refreshToken = localStorage.getItem('refresh_token');
    console.error(error);
    let response = await fetch('`https://freddy.codesubmit.io/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
        // body: refreshToken,
      },
    });
    console.log('from backend', response);
  }
}

fetchData();

function dashboardData(data) {
  console.log(data);
  console.log(Object.values(data)[0]);
  const todayContent = Object.values(data)[0];
  const weekContent = Object.values(data)[1];
  const monthContent = Object.values(data)[2];
  const TodayOrder = document.querySelector('.today-order');
  const WeekOrder = document.querySelector('.week-order');
  const monthOrder = document.querySelector('.month-order');
  TodayOrder.textContent = `$${todayContent.total} / ${todayContent.orders} orders`;
  WeekOrder.textContent = `$${weekContent.total} / ${weekContent.orders} orders`;
  //   monthOrder.textContent = `$${monthContent.total} / ${monthContent.orders} orders`;
}

const hideBtnText = document.querySelector('.hideLogin');
hideBtnText.style.display = 'none';

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

function logout() {
  localStorage.removeItem('access_token');
  location.pathname = '/public/login.html';
}
