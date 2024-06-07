const sheetId = "AKfycbzTFS1QKhSCDBel_2zzTtwE9gZms-rUMeX0m4034tVVdl9oWfOPygjVJbPN2d3hZ_U";
const sheet_name = "Closed Trades";
const action = "read";

// Function to fetch data from Google Sheets
async function fetchData() {
  try {
    const response = await fetch(
      `https://script.google.com/macros/s/${sheetId}/exec?path=${sheet_name}&action=${action}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function processTradingData(tradingData) {
  // Initialize an object to store counting data for each Entry Strategy
  const entryStrategyCount = {};

  // Process each trading data object
  tradingData.forEach((trade) => {
    const { "Entry Strategy": Entry_Strategy, Win, Loss } = trade;

    // Initialize the counting data object for the Entry Strategy if not already done
    if (!entryStrategyCount[Entry_Strategy]) {
      entryStrategyCount[Entry_Strategy] = {
        Entry_Strategy,
        Total_Trades: 0,
        Total_Wins: 0,
        Total_Losses: 0,
        Success_Rate: 0,
      };
    }

    // Update the counting data based on Win and Loss values
    entryStrategyCount[Entry_Strategy].Total_Trades++;
    if (Win) {
      entryStrategyCount[Entry_Strategy].Total_Wins++;
    }
    if (Loss) {
      entryStrategyCount[Entry_Strategy].Total_Losses++;
    }
  });
  Object.values(entryStrategyCount).forEach((strategy) => {
    strategy.Success_Rate = (strategy.Total_Wins / strategy.Total_Trades) * 100;
  });

  // Convert the counting data object into an array of objects
  const countingDataArray = Object.values(entryStrategyCount);

  return countingDataArray;
}

async function initDataTable() {
  const data = await fetchData();
  const loadingIndicator = document.getElementById("loading");
  const tableWrapper = document.querySelector(".table-wrapper");

  if (data.length > 0) {
    generateTable(data);
    $("#dataTable").DataTable(); // Initialize DataTable
    loadingIndicator.style.display = "none";
    tableWrapper.style.display = "block";
    // Adjust height based on content
    const tableHeight = table.offsetHeight;
    const maxHeight = Math.min(tableHeight + 50, window.innerHeight * 0.9); // Calculate max height
    const wrapper = document.querySelector(".table-wrapper");
    wrapper.style.maxHeight = `${maxHeight}px`; // Set max height
    $('#dataTable').DataTable({
        "paging": true,
        "lengthMenu": [5, 10, 25, 50, 100],
        "pageLength": 10,
        "searching": true,
        "info": true
    }); // Initialize DataTable with options
  } else {
    loadingIndicator.innerText = "Failed to load data.";
  }
}

function generateTable(data) {
  console.log(data);
  const result = processTradingData(data);
  console.log(result);
  data = result;
  const table = document.getElementById("dataTable");
  const thead = table.createTHead();
  const tbody = table.createTBody();
  let headers = Object.keys(data[0]);

  let row = thead.insertRow();
  for (let header of headers) {
    let th = document.createElement("th");
    th.appendChild(document.createTextNode(header));
    row.appendChild(th);
  }

  data.forEach((element) => {
    let row = tbody.insertRow();
    for (let key in element) {
      let cell = row.insertCell();
      cell.appendChild(document.createTextNode(element[key]));
    }
  });
}

(async () => {
  const data = await fetchData();
  if (data.length > 0) {
    initDataTable();
  } else {
    loadingIndicator.innerText = "Failed to load data.";
  }
})();
