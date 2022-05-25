let selectedColor = "1";

const colors = {
    "1": "#ff4500",
    "2": "#ffa800",
    "3": "#ffd635",
    "4": "#00a368",
    "5": "#7eed56",
    "6": "#2450a4",
    "7": "#3690ea",
    "8": "#51e9f4",
    "9": "#811e9f",
    "10": "#b44ac0",
    "11": "#ff99aa",
    "12": "#9c6926",
    "13": "#000000",
    "14": "#898d90",
    "15": "#d4d7d9",
    "16": "#ffffff"
}

const canvas = document.getElementById("board");
const ctx = canvas.getContext('2d');

function renderPixels(pixelArray) {
    for (let y = 0; y < pixelArray.length; y += 1) {
        for (let x = 0; x < pixelArray[y].length; x += 1) {
            ctx.fillStyle = colors[pixelArray[y][x]];
            ctx.fillRect(x * 100, y * 100, 100, 100);
        }
    }
}

function updateColor(event) {
    selectedColor = event.target.getAttribute("color");
}

const colorElement = document.getElementById("colors");
for (const color of Object.keys(colors)) {
    colorElement.innerHTML += `<input ${color == "1" ? 'checked=""' : ""} onchange="updateColor(event);" type="radio" name="color" style="background-color: ${colors[color]};" color="${color}"></div>`
}

renderPixels(pixelArray);

board.addEventListener('mousedown', (e) => {
    const rect = board.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom
    
    console.log(~~(x / 100), ~~(y / 100))

})