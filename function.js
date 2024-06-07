
const sheetId = "AKfycbzTFS1QKhSCDBel_2zzTtwE9gZms-rUMeX0m4034tVVdl9oWfOPygjVJbPN2d3hZ_U";
const sheet_name = "Closed Trades";
const action = "read";

// Function to fetch data from Google Sheets
async function fetchData() {
    try {
        const response = await fetch(`https://script.google.com/macros/s/${sheetId}/exec?path=${sheet_name}&action=${action}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

function generateTable(data) {
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

    // Limit data to top 10 entries
    data.slice(0, 10).forEach(element => {
        let row = tbody.insertRow();
        for (let key in element) {
            let cell = row.insertCell();
            cell.appendChild(document.createTextNode(element[key]));
        }
    });
}

(async () => {
    const data = await fetchData();
    const loadingIndicator = document.getElementById("loading");
    const dataTable = document.getElementById("dataTable");

    if (data.length > 0) {
        loadingIndicator.style.display = "none";
        dataTable.style.display = "table";
        generateTable(data);
    } else {
        loadingIndicator.innerText = "Failed to load data.";
    }
})();
