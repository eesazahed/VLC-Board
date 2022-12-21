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
    zoomElement.style.transform = `scale(${(zoom += isTouchPad ? 0.5 : 0.8)})`;
  } else {
    if (zoom <= 1.7) return;
    zoomElement.style.transform = `scale(${(zoom -= isTouchPad ? 0.5 : 0.8)})`;
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
      if (typeof selectedX !== "undefined") {
        renderPixel(selectedX, selectedY, pixelArray[selectedY][selectedX]);
      }

      if (selectedNextX < 0) {
        selectedX = 0;
      } 
      else if (selectedNextX > pixelArray.length) {
        selectedX = pixelArray.length;
      }
      else {
        selectedX = selectedNextX;
      }

      if (selectedNextY < 0) {
        selectedY = 0;
      }
      else if (selectedNextY > pixelArray[0].length) {
        selectedY = selectedNextY > pixelArray[0].length;
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
