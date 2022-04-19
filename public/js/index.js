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

for (const y in pixelArray) {
    for (const x in y) {
        ctx.fillStyle = colors[pixelArray[y][x]];
        ctx.fillRect(x, y, 1, 1);Z
    }
}