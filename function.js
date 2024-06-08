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

function processTradingData(records) {
    const strategySummary = {};

    records.forEach(record => {
        const {
            "Entry Strategy": entryStrategy,
            "Buy Value": buyValue,
            "Sell Value": sellValue,
            "P/L %": plPercentage,
            "Trade Fees": tradeFees,
            "Win": win,
            "Loss": loss,
            "R_Multiple": rMultiple,
            "Duration": duration
        } = record;

        if (!strategySummary[entryStrategy]) {
            strategySummary[entryStrategy] = {
                "Entry Strategy": entryStrategy,
                "Total Trades": 0,
                "Total Wins": 0,
                "Total Losses": 0,
                "Total Money Invested": 0,
                "Total Money Gained": 0,
                "Total Trade Fees": 0,
                "Overall P/L %": 0,
                "Overall Win/Loss Ratio": 0,
                "Average R Multiple": 0,
                "Average Trade Duration": 0,
                "Total P/L %": 0,
                "Total R Multiple": 0,
                "Total Duration": 0
            };
        }

        const summary = strategySummary[entryStrategy];
        summary["Total Trades"]++;
        summary["Total Money Invested"] += buyValue;
        summary["Total Money Gained"] += sellValue;
        summary["Total Trade Fees"] += tradeFees;
        summary["Total P/L %"] += plPercentage;
        summary["Total R Multiple"] += rMultiple;
        summary["Total Duration"] += duration;

        if (win) summary["Total Wins"]++;
        if (loss) summary["Total Losses"]++;
    });

    const result = [];

    for (const strategy in strategySummary) {
        const summary = strategySummary[strategy];
        summary["Overall P/L %"] = (summary["Total P/L %"] / summary["Total Trades"]) * 100;
        summary["Overall Win/Loss Ratio"] = summary["Total Wins"] / (summary["Total Losses"] || 1);
        summary["Average R Multiple"] = summary["Total R Multiple"] / summary["Total Trades"];
        summary["Average Trade Duration"] = summary["Total Duration"] / summary["Total Trades"];
        delete summary["Total P/L %"];
        delete summary["Total R Multiple"];
        delete summary["Total Duration"];
        result.push(summary);
    }

    return result;
}

async function initDataTable() {
    const data = await fetchData();
    const loadingIndicator = document.getElementById("loading");
    const tableWrapper = document.querySelector(".table-wrapper");
    const dashboard = document.getElementById("dashboard");

    if (data.length > 0) {
        loadingIndicator.style.display = "none";
        tableWrapper.style.display = "block";
        generateTable(data);
        $("#dataTable").DataTable(); 

        // Adjust the dashboard size
        dashboard.style.width = "90vw";
        dashboard.style.height = "90vh";

        $('#dataTable').DataTable({
            paging: true,
            lengthMenu: [5, 10, 25, 50, 100],
            pageLength: 10,
            searching: true,
            info: true
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
