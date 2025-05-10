const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let isDragging = false;
let isResizing = false;
let startX, startY, rectX, rectY, rectWidth, rectHeight;

const rectangles = [];
const overlapRects = [];
const handleRadius = 8;

let selectedRect = null;
let selectedHandle = null;
let offsetX = 0, offsetY = 0;
let hoverHandle = null;

function drawAllRectangles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rectangles.sort((a, b) => (a.width * a.height) - (b.width * b.height));
    overlapRects.forEach(overlap => {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(overlap.x, overlap.y, overlap.width, overlap.height);
    });
    rectangles.forEach(rect => {
        ctx.strokeStyle = '#000';
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        drawHandles(rect);
    });
}

function drawHandles(rect) {
    const handles = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x, y: rect.y + rect.height },
        { x: rect.x + rect.width, y: rect.y + rect.height }
    ];

    handles.forEach(handle => {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, handleRadius, 0, Math.PI * 2);
        ctx.fillStyle = handle === hoverHandle ? '#555' : '#333';
        ctx.fill();
    });
}

function updateOverlaps() {
    overlapRects.length = 0;  // Clear old overlaps
    for (let i = 0; i < rectangles.length; i++) {
        for (let j = i + 1; j < rectangles.length; j++) {
            const overlap = getOverlap(rectangles[i], rectangles[j]);
            if (overlap) {
                overlapRects.push(overlap);
            }
        }
    }
    drawAllRectangles();
}

function getOverlap(rect1, rect2) {
    const x = Math.max(rect1.x, rect2.x);
    const y = Math.max(rect1.y, rect2.y);
    const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
    const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;
    return (width > 0 && height > 0) ? { x, y, width, height } : null;
}

function getHandleAtPosition(x, y, rect) {
    const handles = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x, y: rect.y + rect.height },
        { x: rect.x + rect.width, y: rect.y + rect.height }
    ];

    return handles.find(handle =>
        Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2)) <= handleRadius + 4
    );
}

canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    selectedRect = rectangles.find(rect =>
        mouseX > rect.x && mouseX < rect.x + rect.width &&
        mouseY > rect.y && mouseY < rect.y + rect.height
    );

    if (selectedRect) {
        const handle = getHandleAtPosition(mouseX, mouseY, selectedRect);
        if (handle) {
            isResizing = true;
            selectedHandle = handle;
        } else {
            isDragging = true;
            offsetX = mouseX - selectedRect.x;
            offsetY = mouseY - selectedRect.y;
        }
    } else {
        isDrawing = true;
        startX = mouseX;
        startY = mouseY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (isDrawing) {
        rectX = Math.min(startX, mouseX);
        rectY = Math.min(startY, mouseY);
        rectWidth = Math.abs(mouseX - startX);
        rectHeight = Math.abs(mouseY - startY);
        drawAllRectangles();
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    } else if (isDragging && selectedRect) {
        selectedRect.x = mouseX - offsetX;
        selectedRect.y = mouseY - offsetY;
        updateOverlaps();
    } else if (isResizing && selectedRect && selectedHandle) {
        selectedRect.width = Math.max(10, mouseX - selectedRect.x);
        selectedRect.height = Math.max(10, mouseY - selectedRect.y);
        updateOverlaps();
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        rectangles.push({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });
        updateOverlaps();
    }
    isDrawing = false;
    isDragging = false;
    isResizing = false;
    selectedRect = null;
    selectedHandle = null;
    hoverHandle = null;

    console.log("rectangles:");
    console.log(rectangles);
    console.log("overlap rectangles:");
    console.log(overlapRects);
});