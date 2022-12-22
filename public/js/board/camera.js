const zoomElement = document.getElementById("zoom-container");
const board = document.getElementById("board");

let zoom = window.screen.availHeight / 700;
zoomElement.style.transform = `scale(${zoom})`;

let dragging = false;
let currentX = 0;
let currentY = 0;
let initialX, initialY;
let focusTimeout;
let cachedUsers = {};

function zoom_camera(event) {
  const isTouchPad = event.wheelDeltaY
    ? event.wheelDeltaY === -3 * event.deltaY
    : event.deltaMode === 0;

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
    if (focusTimeout) {
      clearTimeout(focusTimeout);
      focusTimeout = null;
    }

    e.preventDefault();

    const currentNextX = (x - initialX) / zoom;
    const currentNextY = (y - initialY) / zoom;

    const selectedNextX = ~((currentNextX - 250) / 10);
    const selectedNextY = ~((currentNextY - 250) / 10);

    const { outOfBoundsX, outOfBoundsY } = crosshairBorderRender(
      selectedNextX,
      selectedNextY
    );

    if (e.type === "touchmove") {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    if (!outOfBoundsX) {
      currentX = (x - initialX) / zoom;
    }
    if (!outOfBoundsY) {
      currentY = (y - initialY) / zoom;
    }

    board.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  }
}

function dragEnd(e) {
  dragging = false;
  board.classList.remove("dragging");
}

function crosshairBorderRender(selectedNextX, selectedNextY) {
  const outOfBoundsX = selectedNextX < 0 || selectedNextX > pixelArray.length;
  const outOfBoundsY =
    selectedNextY < 0 || selectedNextY > pixelArray[0].length;

  if (selectedNextX != selectedX || selectedNextY != selectedY) {
    if (typeof selectedX != "undefined") {
      unrenderCrosshair(selectedX, selectedY);
    }

    if (selectedNextX < 0) {
      selectedX = 0;
    } else if (selectedNextX > pixelArray.length - 1) {
      selectedX = pixelArray.length - 1;
    } else {
      selectedX = selectedNextX;
    }

    if (selectedNextY < 0) {
      selectedY = 0;
    } else if (selectedNextY > pixelArray[0].length - 1) {
      selectedY = pixelArray[0].length - 1;
    } else {
      selectedY = selectedNextY;
    }

    renderCrosshair(selectedX, selectedY);
  }

  return outOfBoundsX, outOfBoundsY;
}

function pixelInfo(x, y) {
  fetch("/pixel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      x,
      y,
    }),
  }).then((response) => {
    if (response.status != 200) {
      ownerElement.innerHTML = "";
      return;
    }

    response.json().then(async (json) => {
      let pixelOwner = json.u;
      if (!cachedUsers[pixelOwner]) {
        const response = await fetch("/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: pixelOwner
          })
        });
        cachedUsers[pixelOwner] = await response.json();
      };
      ownerElement.innerHTML = `<img src="${cachedUsers[pixelOwner].picture}" alt="${cachedUsers[pixelOwner].name}">
      <h3 class="name">${cachedUsers[pixelOwner].name}</h3>`;
    });
  });
}

document.addEventListener("wheel", zoom_camera);

document.addEventListener("touchstart", dragStart);
document.addEventListener("touchend", dragEnd);
document.addEventListener("touchmove", drag);

document.addEventListener("mousedown", dragStart);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("mousemove", drag);

let pointerdown = false;

function pixelFocus(e) {
  if (!pointerdown) {
    if (typeof selectedX !== "undefined") {
      unrenderCrosshair(selectedX, selectedY);
    }

    const rect = board.getBoundingClientRect();

    const selectedNextX = ~~((e.clientX - rect.left) / zoom / 10);
    const selectedNextY = ~~((e.clientY - rect.top) / zoom / 10);

    crosshairBorderRender(selectedNextX, selectedNextY);
    pixelInfo(selectedNextX, selectedNextY);

    currentX = canvas.width / 2 - (e.clientX - rect.left) / zoom;
    currentY = canvas.height / 2 - (e.clientY - rect.top) / zoom;
    board.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  }
}

let holdTimeStart;

board.onpointerdown = function (e) {
  focusTimeout = setTimeout(() => {
    pixelFocus(e);
  }, 300);
  pointerdown = true;
};

board.onpointerup = function (e) {
  pointerdown = false;

  if (focusTimeout) {
    clearTimeout(focusTimeout);
    focusTimeout = null;
    pixelFocus(e);
  }
};
