const zoomElement = document.getElementById("zoom-container");
const board = document.getElementById("board");

let zoom = window.screen.availHeight / 8000;
zoomElement.style.transform = `scale(${zoom})`;

let dragging = false;
let currentX = 0;
let currentY = 0;
let initialX, initialY;

function zoom_camera(event) {
  const isTouchPad = event.wheelDeltaY ? event.wheelDeltaY === -3 * event.deltaY : event.deltaMode === 0;

  if (event.deltaY < 0) {
    if (zoom >= 1) return;
    zoomElement.style.transform = `scale(${(zoom += isTouchPad ? 0.02 : 0.05)})`;
  } else {
    if (zoom <= 0.15) return;
    zoomElement.style.transform = `scale(${(zoom -= isTouchPad ? 0.02 : 0.05)})`;
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

function dragEnd(e) {
  dragging = false;
  board.classList.remove("dragging");
}

function move(e) {
  if (dragging) {
    e.preventDefault();

    if (e.type === "touchmove") {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    currentX = (x - initialX) / zoom;
    currentY = (y - initialY) / zoom;

    // if (currentX >= 1000 || currentX <= -1000) return;
    // if (currentY >= 1000 || currentY <= -1000) return;
    board.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  }
}

document.addEventListener("wheel", zoom_camera);

board.addEventListener("touchstart", dragStart);
document.addEventListener("touchend", dragEnd);
document.addEventListener("touchmove", move);

board.addEventListener("mousedown", dragStart);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("mousemove", move);
