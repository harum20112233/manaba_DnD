(function () {
  // Create a drag-and-drop overlay
  const dropOverlay = document.createElement("div");
  dropOverlay.id = "manaba-droppable-overlay";
  dropOverlay.style.position = "fixed";
  dropOverlay.style.top = "0";
  dropOverlay.style.left = "0";
  dropOverlay.style.width = "100%";
  dropOverlay.style.height = "100%";
  dropOverlay.style.zIndex = "9999";
  dropOverlay.style.background = "rgba(0, 0, 0, 0.3)";
  dropOverlay.style.display = "none";
  dropOverlay.style.alignItems = "center";
  dropOverlay.style.justifyContent = "center";
  dropOverlay.style.color = "white";
  dropOverlay.style.fontSize = "24px";
  dropOverlay.innerText = "Drop file to submit assignment";
  document.body.appendChild(dropOverlay);

  let dragCounter = 0;

  // Show overlay on drag enter
  document.addEventListener("dragenter", function (e) {
    e.preventDefault();
    dragCounter++;
    dropOverlay.style.display = "flex";
  });

  // Prevent default drag over behavior
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
  });

  // Hide overlay when leaving drag area
  document.addEventListener("dragleave", function (e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      dropOverlay.style.display = "none";
    }
  });

  // Handle file drop
  document.addEventListener("drop", function (e) {
    e.preventDefault();
    dropOverlay.style.display = "none";
    dragCounter = 0;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Attempt to find the file input element on the page
      const fileInput = document.querySelector("input[type='file']");
      if (fileInput) {
        // Create a DataTransfer object to simulate the file drop
        const dataTransfer = new DataTransfer();
        for (let i = 0; i < files.length; i++) {
          dataTransfer.items.add(files[i]);
        }
        fileInput.files = dataTransfer.files;
        // Trigger a change event to notify the page the file input has changed
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });
})();
