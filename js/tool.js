let selectedObjects = []; // Store selected points

function updateLabel(input) {
  const file = input.files[0];
  const fileNameDisplay = document.getElementById("file-name");
  const imageContainer = document.querySelector(".tool-img");
  const loadingIndicator = document.querySelector(".loading-indicator"); // Add loading indicator element

  if (file) {
    fileNameDisplay.textContent = file.name;

    // Show loading indicator
    loadingIndicator.style.display = "block";

    const reader = new FileReader();
    reader.onload = async function (e) {
      const arrayBuffer = e.target.result;

      // Handle TIFF files with GeoTIFF.js
      if (file.name.endsWith(".tif") || file.name.endsWith(".tiff")) {
        try {
          const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
          const image = await tiff.getImage();
          const width = image.getWidth();
          const height = image.getHeight();

          // Get the raster data (e.g., RGBA values)
          const rasterData = await image.readRasters();
          let rgba = [];

          // If the image has multiple bands (e.g., RGB)
          if (rasterData.length >= 3) {
            const redBand = rasterData[0];
            const greenBand = rasterData[1];
            const blueBand = rasterData[2];
            for (let i = 0; i < width * height; i++) {
              rgba.push(redBand[i], greenBand[i], blueBand[i], 255); // RGBA format
            }
          } else {
            // Handle grayscale image
            const grayscale = rasterData[0];
            for (let i = 0; i < width * height; i++) {
              rgba.push(grayscale[i], grayscale[i], grayscale[i], 255); // RGBA format
            }
          }

          const canvas = document.createElement("canvas");
          canvas.id = "imageCanvas";
          canvas.width = width;
          canvas.height = height;
          canvas.className = "rounded-2";
          canvas.style.cursor = "crosshair";
          const ctx = canvas.getContext("2d");

          const imageData = ctx.createImageData(width, height);
          imageData.data.set(rgba);
          ctx.putImageData(imageData, 0, 0);

          imageContainer.classList.add("active");
          imageContainer.innerHTML = "";
          imageContainer.appendChild(canvas);

          // Hide loading indicator once image is processed
          loadingIndicator.style.display = "none";

          // Tooltip for coordinates
          let tooltip = document.createElement("div");
          tooltip.classList.add("coordinate-tooltip");
          document.body.appendChild(tooltip);

          // Mouse move event to track coordinates and display tooltip
          canvas.addEventListener("mousemove", function (event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
          
            tooltip.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
          
            // 💡 Ensure the tooltip is visible when mouse moves inside again
            tooltip.style.display = "block";
          });
          

          // Mouse leave event to remove the tooltip
          canvas.addEventListener("mouseleave", function () {
            tooltip.style.display = "none";
          });

          // Click handler to select coordinates
          canvas.addEventListener("click", function (event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const objectData = { x: Math.round(x), y: Math.round(y) };
            selectedObjects.push(objectData);

            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();

            updateCoordinatesTable(objectData);
          });

        } catch (error) {
          console.error("Error processing TIFF file:", error);
          loadingIndicator.style.display = "none"; // Hide loading indicator on error
        }

      } else if (file.type.startsWith("image/")) {
        // Fallback for regular image formats (png, jpeg, etc.)
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.id = "imageCanvas";
          canvas.width = img.width / 1.5;
          canvas.height = img.height / 1.5;
          canvas.className = "rounded-2";
          canvas.style.cursor = "crosshair";

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          imageContainer.classList.add("active");
          imageContainer.innerHTML = "";
          imageContainer.appendChild(canvas);

          // Hide loading indicator once image is processed
          loadingIndicator.style.display = "none";

          // Tooltip for coordinates
          let tooltip = document.createElement("div");
          tooltip.classList.add("coordinate-tooltip");
          document.body.appendChild(tooltip);

          // Mouse move event to track coordinates and display tooltip
          canvas.addEventListener("mousemove", function (event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            tooltip.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
            tooltip.style.left = `${event.pageX + 10}px`; // Position slightly to the right
            tooltip.style.top = `${event.pageY + 10}px`; // Position slightly below
          });

          // Mouse leave event to remove the tooltip
          canvas.addEventListener("mouseleave", function () {
            tooltip.style.display = "none";
          });

          // Click handler to select coordinates
          canvas.addEventListener("click", function (event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const objectData = { x: Math.round(x), y: Math.round(y) };
            selectedObjects.push(objectData);

            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();

            updateCoordinatesTable(objectData);
          });
        };
        img.src = URL.createObjectURL(file);
      } else {
        imageContainer.classList.remove("active");
        imageContainer.innerHTML = `<p class="text-white">Preview not available for this file type.</p>`;
        loadingIndicator.style.display = "none"; // Hide loading indicator if file type is not supported
      }
    };

    reader.readAsArrayBuffer(file);
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
