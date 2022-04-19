// I skidded all of this code. ALL OF IT

const zoomElement = document.getElementById("zoom-container");
let zoom = 1;
const ZOOM_SPEED = 0.1;

document.addEventListener("wheel", function(e) {
    if (e.deltaY < 0) {
        zoomElement.style.transform = `scale(${zoom += ZOOM_SPEED})`;
    } else {
        zoomElement.style.transform = `scale(${zoom -= ZOOM_SPEED})`;
    }
});


var dragItem = document.getElementById("board");
var container = document.getElementById("container");

var active = false;
var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0;

container.addEventListener("touchstart", dragStart);
container.addEventListener("touchend", dragEnd);
container.addEventListener("touchmove", drag);

container.addEventListener("mousedown", dragStart);
container.addEventListener("mouseup", dragEnd);
container.addEventListener("mousemove", drag);

function dragStart(e) {
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    if (e.target === dragItem) {
        active = true;
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    active = false;
}

function drag(e) {
    if (active) {
        e.preventDefault();

        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        dragItem.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
}
