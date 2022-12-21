let selectedX = 0;
let selectedY = 0;
let pixelArray, interval;
const coordElement = document.getElementById("pixel");
const placeButton = document.getElementById("placePixel");

const colors = {
  1: "#e50000",
  2: "#ff4500",
  3: "#e5d900",
  4: "#02be01",
  // 5: "#94e044",
  6: "#2450a4",
  // 7: "#2196F3",
  8: "#51e9f4",
  // 9: "#811e9f",
  10: "#b44ac0",
  11: "#ff99aa",
  12: "#9c6926",
  13: "#000000",
  // 14: "#898d90",
  15: "#d4d7d9",
  16: "#ffffff",
};

const keys = Object.keys(colors);
let selectedColor;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

ctx.scale(1, 1);

function renderPixels(pixelArray) {
  for (let y = 0; y < pixelArray.length; y += 1) {
    for (let x = 0; x < pixelArray[y].length; x += 1) {
      if (pixelArray[y][x] != 16) {
        ctx.fillStyle = colors[pixelArray[y][x]];
        ctx.fillRect(x * 10, y * 10, 10, 10);
      }
    }
  }
}

function renderPixel(x, y, color) {
  ctx.fillStyle = colors[color];
  ctx.fillRect(x * 10, y * 10, 10, 10);
}

function updateColor(event) {
  selectedColor = event.target.getAttribute("color");
  new Audio("audio/Select Color.mp3").play();
  showPlaceButton();
}

function showPlaceButton() {
  if (typeof selectedX !== "undefined" && selectedColor) {
    placeButton.classList.add("show");
  }
}

function renderCrosshair(selectedX, selectedY) {
  if (selectedColor) {
    new Audio("audio/Select Tile & Open Color Select.mp3").play();
  }

  const x = selectedX * 10;
  const y = selectedY * 10;

  ctx.fillStyle = "#000";

  ctx.fillRect(x, y, 3, 1);
  ctx.fillRect(x, y, 1, 3);

  ctx.fillRect(x + 7, y, 3, 1);
  ctx.fillRect(x + 9, y, 1, 3);

  ctx.fillRect(x, y + 7, 1, 3);
  ctx.fillRect(x, y + 9, 3, 1);

  ctx.fillRect(x + 7, y + 9, 3, 1);
  ctx.fillRect(x + 9, y + 7, 1, 3);

  ctx.fillStyle = "#e0e2e4";

  ctx.fillRect(x + 1, y + 1, 2, 0.7);
  ctx.fillRect(x + 1, y + 1, 0.7, 2);

  ctx.fillRect(x + 7, y + 1, 2, 0.7);
  ctx.fillRect(x + 8.3, y + 1, 0.7, 2);
  
  ctx.fillRect(x + 1, y + 7, 0.7, 2);
  ctx.fillRect(x + 1, y + 8.3, 2, 0.7);  
  
  ctx.fillRect(x + 7, y + 8.3, 2, 0.7);
  ctx.fillRect(x + 8.3, y + 7, 0.7, 2);

  coordElement.classList.add("show");
  coordElement.innerHTML = `${selectedX + 1}, ${selectedY + 1}`;

  showPlaceButton();
}

const socket = io();

socket.on("pixelUpdate", function (event) {
  pixelArray = event.pixelArray;
  renderPixel(event.x, event.y, event.color);
});

socket.on("canvasUpdate", function (event) {
  pixelArray = event.pixelArray;
  renderPixels(event.pixelArray);
});

function placePixel(event) {
  fetch("/placepixel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: id_token,
      selectedX: selectedX,
      selectedY: selectedY,
      selectedColor: selectedColor,
    }),
  }).then((response) => {
    if (response.status == 403) {
      placeButton.classList.add("red");
      setTimeout(() => {
        placeButton.classList.remove("red");
      }, 2000);
    } else if (response.status == 200) {
      new Audio("audio/Pixel Placed.mp3").play();
    }
    response.json().then((json) => {
      generateCountdown(placeButton, json.cooldown);
    });
  });
}

function generateCountdown(element, timestamp) {
  const enableTime = new Date(timestamp);
  if (interval) {
    clearInterval(interval);
  }
  const timeRemaining = Math.ceil(
    (enableTime.getTime() - new Date().getTime()) / 100
  );
  if (1 > timeRemaining) {
    return;
  }

  element.classList.remove("enabled");
  interval = setInterval(() => {
    const timeRemaining = Math.ceil(
      (enableTime.getTime() - new Date().getTime()) / 1000
    );

    const minute = ~~(timeRemaining / 59.9).toString();
    const second = (timeRemaining % 60).toString();

    element.innerHTML = `${minute.length == 1 ? "0" : ""}${minute}:${
      second.length == 1 ? "0" : ""
    }${second}`;
    if (1 > timeRemaining) {
      element.classList.add("enabled");
      element.innerHTML = "✓";
      clearInterval(interval);
      interval = undefined;
      new Audio("audio/Pixel Ready.mp3").play();
    }
  }, 1000);
}
