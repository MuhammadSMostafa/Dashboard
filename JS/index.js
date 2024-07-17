const links = document.querySelectorAll("aside .link");
const dashboard = document.querySelector(".dashboard");
const customers = document.querySelector(".customers");
const table = document.querySelectorAll("tbody");
let customersData;
let transactionsData;
let customisedData = [];
const totalCustomers = document.getElementById("total-customers");
const totalTransaction = document.getElementById("total-transaction");
const totalAmount = document.getElementById("total-amount");
let totalMoney = 0;
const userName = document.getElementById("user-name");
const searchInput = document.getElementById("search-input");
const userData = document.getElementById("user-data");

setData();

async function fetchTransactions() {
  const response = await fetch(
    "https://muhammadsmostafa.github.io/Dashboard/transactions.json"
  );
  const data = await response.json();
  return data;
}

async function fetchCustomers() {
  const response = await fetch(
    "https://muhammadsmostafa.github.io/Dashboard/customers.json"
  );
  const data = await response.json();
  return data;
}

searchInput.addEventListener("input", function () {
  search(searchInput.value);
});

links.forEach((element) => {
  element.addEventListener("click", function () {
    document.querySelector("aside .link.active").classList.remove("active");
    element.classList.add("active");
    if (element.id === "dashboard") {
      dashboard.classList.remove("d-none");
      customers.classList.add("d-none");
    } else {
      customers.classList.remove("d-none");
      dashboard.classList.add("d-none");
    }
  });
});

function showUser(userId) {
  customersData.forEach((element) => {
    if (element.id == userId) {
      userName.innerHTML = element.name;
      userData.innerHTML = userTransactions(userId);
    }
  });
}

function userTransactions(id) {
  document.querySelector("#chart").innerHTML = "";
  container = "";
  let amountArray = [0, 0, 0, 0];
  let datesArray = ["2022-01-01", "2022-01-02", "2022-01-03", "2022-01-04"];
  customisedData.forEach((user) => {
    if (user.id == id) {
      user.transactions.forEach((element) => {
        container += `
        <div class="transaction">
        <p>
        Data: ${element.date}
        </p>
        <p>
        Amount: ${element.amount}
        </p>
        </div>
        `;
        amountArray[datesArray.indexOf(element.date)] += element.amount;
      });
    }
  });
  showChar(amountArray, datesArray);
  return container;
}

function showChar(amountArray, datesArray) {
  let options = {
    chart: {
      type: "area",
    },
    series: [
      {
        name: "Amount",
        data: amountArray,
      },
    ],
    xaxis: {
      categories: datesArray,
    },
  };
  const chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

async function setData() {
  customersData = await fetchCustomers();
  transactionsData = await fetchTransactions();
  customiseData();
  totalCustomers.innerHTML = customersData.length;
  totalTransaction.innerHTML = transactionsData.length;
  table[0].innerHTML = table[1].innerHTML = getTableData();
  showUser(1);
  document.getElementById("loader").classList.add("d-none");
}

function customiseData() {
  customersData.forEach((customer) => {
    let transactions = [];
    transactionsData.forEach((transaction) => {
      if (transaction["customer_id"] == customer.id) {
        transactions.push({
          date: transaction.date,
          amount: transaction.amount,
        });
      }
    });
    customisedData.push({
      id: customer.id,
      name: customer.name,
      transactions: transactions,
    });
  });
}

function search(text) {
  container = "";
  customisedData.forEach((element) => {
    if (element.name.toLowerCase().includes(text.toLowerCase())) {
      container += getRowTable(element, false);
    }
  });
  table[1].innerHTML = container;
}

function getTableData(element = customisedData) {
  totalMoney = 0;
  let container = "";
  element.forEach((element) => {
    container += getRowTable(element);
  });
  return container;
}

function getRowTable(element, total = true) {
  let transactionsAmount = 0;
  element.transactions.forEach((transaction) => {
    if (total) {
      totalMoney += transaction.amount;
    }
    transactionsAmount += transaction.amount;
  });
  const container = `   <tr>
    <td>${element.name}</td>
    <td>$${transactionsAmount}</td>
    <td>${element.transactions.length}</td>
    <td class="table-button""><button onClick="showUser(${element.id})">View</button></td>
    </tr>`;
  totalAmount.innerHTML = `$${totalMoney}`;
  return container;
}

function filterByAmount() {
  let sortedDataByAmount = customisedData.sort((a, b) => {
    const totalAmountA = a.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    const totalAmountB = b.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    return totalAmountB - totalAmountA;
  });
  table[1].innerHTML = getTableData(sortedDataByAmount);
}

function filterByName() {
  table[1].innerHTML = getTableData(
    customisedData.sort((a, b) => a.name.localeCompare(b.name))
  );
}
