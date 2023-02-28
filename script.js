'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2023-02-19T14:11:59.604Z',
    '2023-02-20T17:01:17.194Z',
    '2023-02-22T23:36:17.929Z',
    '2023-02-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pl-PL', 
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];


// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const btnLogout = document.querySelector('.login__logout');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formLogin = document.querySelector('.login');

// Functions

const formatMovementDates = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  else if (daysPassed === 1) return 'Yesterday';
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  else return new Intl.DateTimeFormat(locale).format(date);
  
};

const formatCurrencies = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const startLogOutTimer = () => {
  const tick = () => {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      hideLogout();
      showLogin();
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };

  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDates(date, acc.locale);

    const formattedMov = formatCurrencies(movement, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calculateBalance = account => {
  account.balance = account.movements.reduce((acc, cur) => {
    return (acc += cur);
  }, 0);

  labelBalance.textContent = formatCurrencies(
    account.balance,
    account.locale,
    account.currency
  );
};

const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);

  let outcomes;
  const outcomesFilter = account.movements.filter(mov => mov < 0);
  if (outcomesFilter.length > 0)
    outcomes = outcomesFilter.reduce((acc, mov) => acc + mov);
  else outcomes = 0;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, interest) => acc + interest);

  labelSumIn.textContent = formatCurrencies(
    incomes,
    account.locale,
    account.currency
  );
  labelSumOut.textContent = formatCurrencies(
    Math.abs(outcomes),
    account.locale,
    account.currency
  );
  labelSumInterest.textContent = formatCurrencies(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = acc => {
  displayMovements(acc);
  calculateBalance(acc);
  calcDisplaySummary(acc);
};

const hideLogin = () => {
  formLogin.style.display = 'none';
};

const showLogin = () => {
  formLogin.style.display = 'block';
};

const showLogout = () => {
  btnLogout.style.display = 'block';
};

const hideLogout = () => {
  btnLogout.style.display = 'none';
};

const createUsername = accountsArr => {
  accountsArr.forEach(acc => {
    acc.username = acc.owner
      .split(' ')
      .map(name => name.toLowerCase().at(0))
      .join('');
  });
};

createUsername(accounts);

// event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', e => {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
   
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    containerApp.style.opacity = 1;

    if(timer) clearInterval(timer);
    timer = startLogOutTimer();


    updateUI(currentAccount);
    hideLogin();
    showLogout();
  }
});

btnLogout.addEventListener('click', e => {
  e.preventDefault();
  containerApp.style.opacity = 0;
  hideLogout();
  showLogin();
  labelWelcome.textContent = 'Log in to get started';
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    receiverAccount &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    setTimeout(() => {
      receiverAccount?.movements.push(amount);
      currentAccount?.movements.push(amount * -1);
  
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2000); 
  }

  updateUI(currentAccount);
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();

  clearInterval(timer);
  timer = startLogOutTimer();
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  // tylko gdy wczesniej byl depozyt minimum 10% porządanej kwoty
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2000);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    currentAccount?.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

let sortedState = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sortedState);
  sortedState = !sortedState;
});

