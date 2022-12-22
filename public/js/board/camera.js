const zoomElement = document.getElementById("zoom-container");
const board = document.getElementById("board");

let zoom = window.screen.availHeight / 700;
zoomElement.style.transform = `scale(${zoom})`;

let dragging = false;
let currentX = 0;
let currentY = 0;
let initialX, initialY;

function zoom_camera(event) {
  const isTouchPad = event.wheelDeltaY ? event.wheelDeltaY === -3 * event.deltaY : event.deltaMode === 0;
  
  if (event.deltaY < 0) {
    if (zoom >= 7) return;
    zoomElement.style.transform = `scale(${(zoom += isTouchPad ? 0.4 : 0.5)})`;
  } else {
    if (zoom <= 1.7) return;
    zoomElement.style.transform = `scale(${(zoom -= isTouchPad ? 0.4 : 0.5)})`;
  }
}

function dragStart(e) {
  if (e.type === "touchmove") {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  initialX = x - currentX * zoom;
  initialY = y - currentY * zoom;

  dragging = true;
  board.classList.add("dragging");
}

function drag(e) {
  if (dragging) {
    e.preventDefault();

    const currentNextX = (x - initialX) / zoom;
    const currentNextY = (y - initialY) / zoom;

    const selectedNextX = ~((currentNextX - 250) / 10);
    const selectedNextY = ~((currentNextY - 250) / 10);

    const outOfBoundsX = selectedNextX < 0 || selectedNextX > pixelArray.length;
    const outOfBoundsY = selectedNextY < 0 || selectedNextY > pixelArray[0].length;

    if (selectedNextX != selectedX || selectedNextY != selectedY) {
      if (typeof selectedX != "undefined") {
        // Old Pixel
        renderPixel(selectedX, selectedY, pixelArray[selectedY][selectedX]);

        // Old Pixel Left
        if (pixelArray[selectedY][selectedX - 1]) {
          renderPixel(selectedX - 1, selectedY, pixelArray[selectedY][selectedX - 1]);
        }

        // Old Pixel Right
        if (pixelArray[selectedY][selectedX + 1]) {
          renderPixel(selectedX + 1, selectedY, pixelArray[selectedY][selectedX + 1]);          
        }

        // Old Pixel Up
        if (pixelArray[selectedY - 1]) {
          renderPixel(selectedX, selectedY - 1, pixelArray[selectedY - 1][selectedX]);
        }

        // Old Pixel Down
        if (pixelArray[selectedY + 1]) {
          renderPixel(selectedX, selectedY + 1, pixelArray[selectedY + 1][selectedX]);
        }

        // Old Pixel Top
        if (pixelArray[selectedY - 1]) {
          // Old Pixel Top Right
          if (pixelArray[selectedY - 1][selectedX + 1]) {
            renderPixel(selectedX + 1, selectedY - 1, pixelArray[selectedY - 1][selectedX + 1]);
          }

          // Old Pixel Top Left
          if (pixelArray[selectedY - 1][selectedX - 1]) {
            renderPixel(selectedX - 1, selectedY - 1, pixelArray[selectedY - 1][selectedX - 1]);
          }
        }

        // Old Pixel Bottom
        if (pixelArray[selectedY + 1]) {
          // Old Pixel Bottom Right
          if (pixelArray[selectedY + 1][selectedX + 1]) {
            renderPixel(selectedX + 1, selectedY + 1, pixelArray[selectedY + 1][selectedX + 1]);
          }

          // Old Pixel Bottom Left
          if (pixelArray[selectedY + 1][selectedX - 1]) {
            renderPixel(selectedX - 1, selectedY + 1, pixelArray[selectedY + 1][selectedX - 1]);
          }
        }
      }

      if (selectedNextX < 0) {
        selectedX = 0;
      } 
      else if (selectedNextX > pixelArray.length - 1) {
        selectedX = pixelArray.length - 1;
      }
      else {
        selectedX = selectedNextX;
      }

      if (selectedNextY < 0) {
        selectedY = 0;
      }
      else if (selectedNextY > pixelArray[0].length - 1) {
        selectedY = pixelArray[0].length - 1;
      }
      else {
        selectedY = selectedNextY;
      }

      renderCrosshair(selectedX, selectedY);
    }

    if (e.type === "touchmove") {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    if (!outOfBoundsX) {
      currentX = (x - initialX) / zoom;
    };
    if (!outOfBoundsY) {
      currentY = (y - initialY) / zoom;
    };

    board.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  }
}

function dragEnd(e) {
  dragging = false;
  board.classList.remove("dragging");
}

document.addEventListener("wheel", zoom_camera);

document.addEventListener("touchstart", dragStart);
document.addEventListener("touchend", dragEnd);
document.addEventListener("touchmove", drag);

document.addEventListener("mousedown", dragStart);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("mousemove", drag);
