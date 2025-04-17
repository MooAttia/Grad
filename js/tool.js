let selectedObjects = []; // Store selected points

function updateLabel(input) {
  const file = input.files[0];
  const fileNameDisplay = document.getElementById("file-name");
  const imageContainer = document.querySelector(".tool-img");

  if (file) {
    fileNameDisplay.textContent = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
      if (file.type.startsWith("image/")) {
        imageContainer.classList.add("active"); // 👈 Add this line
        imageContainer.innerHTML = `<canvas id="imageCanvas" class="rounded-2" style="cursor: crosshair; display: block; max-width: 100%; height: auto; margin: auto;"></canvas>`;
        const canvas = document.getElementById("imageCanvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = function () {
          // Resize canvas based on image size
          canvas.width = img.width / 1.5;
          canvas.height = img.height / 1.5;

          // Resize parent container based on image
          imageContainer.style.width = `${canvas.width}px`;
          imageContainer.style.height = `${canvas.height}px`;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;

        // Handle click to select points
        canvas.addEventListener("click", function (event) {
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const objectData = { x: Math.round(x), y: Math.round(y) };
          selectedObjects.push(objectData);
          console.log("Selected Objects:", selectedObjects);

          ctx.fillStyle = "blue";
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();

          updateCoordinatesTable(objectData);
        });

        function updateCoordinatesTable(objectData) {
          const tableBody = document.getElementById("coordinates-table-body");
          const newRow = document.createElement("tr");

          newRow.innerHTML = `
            <td>${selectedObjects.length}</td>
            <td>${objectData.x}</td>
            <td>${objectData.y}</td>
          `;
          tableBody.appendChild(newRow);
        }
      } else {
        imageContainer.classList.remove("active"); 
        imageContainer.innerHTML = `<p class="text-white">Preview not available for this file type.</p>`;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Export buttons
document.querySelector(".export").addEventListener("click", function () {
  const format = document.getElementById("export-format").value;

  if (selectedObjects.length === 0) {
    alert("No data to export!");
    return;
  }

  if (format === "csv") {
    exportToCSV();
  } else if (format === "xlsx") {
    exportToExcel();
  } else if (format === "json") {
    exportToJSON(); 
  }
});

// Export to CSV
function exportToCSV() {
  let csvContent = "data:text/csv;charset=utf-8,Index,X,Y\n";

  selectedObjects.forEach((obj, index) => {
    csvContent += `${index + 1},${obj.x},${obj.y}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "coordinates.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to Excel
function exportToExcel() {
  let worksheetData = [["Index", "X", "Y"]];

  selectedObjects.forEach((obj, index) => {
    worksheetData.push([index + 1, obj.x, obj.y]);
  });

  let workbook = XLSX.utils.book_new();
  let worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Coordinates");

  XLSX.writeFile(workbook, "coordinates.xlsx");
}

// Export to JSON
function exportToJSON() {
  const jsonData = JSON.stringify(selectedObjects, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "coordinates.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
