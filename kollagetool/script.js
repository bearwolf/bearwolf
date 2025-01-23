let isDragging = false;

document.addEventListener('DOMContentLoaded', () => {
    const fileInputs = [
        document.getElementById('file1'),
        document.getElementById('file2'),
        document.getElementById('file3')
    ];
    const zoomInputs = [
        document.getElementById('zoom1'),
        document.getElementById('zoom2'),
        document.getElementById('zoom3')
    ];
    const createButton = document.getElementById('createCollage');
    const canvas = document.getElementById('collageCanvas');
    const ctx = canvas.getContext('2d');
    const downloadLink = document.getElementById('downloadLink');

    // Set canvas size to 1920x1080
    canvas.width = 1920;
    canvas.height = 1080;

    // Collage configuration
    const config = {
        dividerWidth: 20,
        angle: Math.PI / 12, // 15 degrees (75 degrees from vertical)
        imageWidth: canvas.width / 3,
        shift: 0, // Will be calculated based on angle
        offset: 0,
    };

    config.shift = canvas.height * Math.tan(config.angle) + config.offset;

    // Predefined image sources
    const defaultImageSources = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

    const images = [];
    let draggingIndex = -1;
    let dragStartX, dragStartY;

    // Load default images and create initial collage
    loadImagesAndCreateCollage(defaultImageSources);

    // Add event listener for file inputs
    fileInputs.forEach((input, index) => {
        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const img = new Image();
                img.onload = () => {
                    images[index] = img;
                    images[index].scale = 1;
                    images[index].offsetX = 0;
                    images[index].offsetY = 0;
                    drawCollage();
                    updateZoomInputs();
                };
                img.src = URL.createObjectURL(e.target.files[0]);
            }
        });
    });

    // Add event listeners for zoom inputs
    zoomInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (images[index]) {
                images[index].scale = parseFloat(e.target.value);
                drawCollage();
            }
        });
    });

    createButton.addEventListener('click', drawCollage);

    // Add mouse handlers for canvas
    canvas.addEventListener('mousedown', startDragging);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);

    document.addEventListener('mousemove', preventDefaultIfDragging);
document.addEventListener('mouseup', stopDragging);
function startDragging(e) {
    e.preventDefault(); // Förhindra standardbeteende
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    draggingIndex = Math.floor(x / config.imageWidth);
    if (draggingIndex >= 0 && draggingIndex < images.length) {
        dragStartX = x;
        dragStartY = y;
    }
}

function drag(e) {
    if (!isDragging || draggingIndex === -1) return;

    e.preventDefault(); // Förhindra standardbeteende

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Resten av din drag-funktion förblir oförändrad
    // ...
}

function stopDragging(e) {
    if (isDragging) {
        e.preventDefault(); // Förhindra standardbeteende
        if (draggingIndex !== -1) {
            snapToGrid();
        }
        draggingIndex = -1;
    }
    isDragging = false;
}

function preventDefaultIfDragging(e) {
    if (isDragging) {
        e.preventDefault();
    }
}

    function startDragging(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        draggingIndex = Math.floor(x / config.imageWidth);
        if (draggingIndex >= 0 && draggingIndex < images.length) {
            dragStartX = x;
            dragStartY = y;
        }
    }

    function drag(e) {
        if (draggingIndex === -1) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - dragStartX;
        const dy = y - dragStartY;

        const img = images[draggingIndex];
        const newOffsetX = (img.offsetX || 0) + dx;
        const newOffsetY = (img.offsetY || 0) + dy;

        // Calculate constraints
        const scale = img.scale || 1;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const maxOffsetX = (scaledWidth - config.imageWidth) / 2;
        const maxOffsetY = (scaledHeight - canvas.height) / 2;

        // Apply constraints
        img.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX));
        img.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY));

        dragStartX = x;
        dragStartY = y;

        drawCollage();
    }

    function stopDragging() {
        if (draggingIndex !== -1) {
            snapToGrid();
        }
        draggingIndex = -1;
    }

    function snapToGrid() {
        const snapIncrement = 10;
        images.forEach(img => {
            img.offsetX = Math.round((img.offsetX || 0) / snapIncrement) * snapIncrement;
            img.offsetY = Math.round((img.offsetY || 0) / snapIncrement) * snapIncrement;
        });
        drawCollage();
    }

    function loadImagesAndCreateCollage(sources) {
        Promise.all(sources.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    img.scale = 1; // Add default scale
                    img.offsetX = 0; // Add default x offset
                    img.offsetY = 0; // Add default y offset
                    resolve(img);
                };
                img.onerror = reject;
                img.src = src;
            });
        })).then(loadedImages => {
            images.push(...loadedImages);
            drawCollage();
            updateZoomInputs(); // Update zoom inputs with default values
        });
    }

    function updateZoomInputs() {
        zoomInputs.forEach((input, index) => {
            if (images[index]) {
                input.value = images[index].scale || 1;
            }
        });
    }

    function drawCollage() {
        // Clear main canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        images.forEach((img, index) => {
            drawImage(img, index);
        });

        drawDividers();

        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.style.display = 'inline-block';
    }

    function drawImage(img, index) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = config.imageWidth + config.shift;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Use the specified scale or default to 1
        const scale = img.scale || 1;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Calculate centering and apply offset
        const xOffset = (tempCanvas.width - scaledWidth) / 2 + (img.offsetX || 0);
        const yOffset = (tempCanvas.height - scaledHeight) / 2 + (img.offsetY || 0);

        // Draw the image on the temporary canvas
        tempCtx.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);

        // Create a path for clipping
        tempCtx.beginPath();
        const clipPath = getClipPath(index);
        clipPath.forEach((point, i) => {
            if (i === 0) tempCtx.moveTo(point.x, point.y);
            else tempCtx.lineTo(point.x, point.y);
        });
        tempCtx.closePath();

        // Clip and clear the area outside the path
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.fill();

        // Draw the clipped image onto the main canvas
        ctx.drawImage(tempCanvas, index * config.imageWidth - (index > 0 ? config.shift : 0), 0);
    }

    function getClipPath(index) {
        const { imageWidth, shift } = config;
        if (index === 0) {
            return [
                {x: 0, y: 0},
                {x: imageWidth + shift, y: 0},
                {x: imageWidth, y: canvas.height},
                {x: 0, y: canvas.height}
            ];
        } else if (index === 1) {
            return [
                {x: shift, y: 0},
                {x: imageWidth + shift, y: 0},
                {x: imageWidth, y: canvas.height},
                {x: 0, y: canvas.height}
            ];
        } else {
            return [
                {x: shift, y: 0},
                {x: imageWidth + shift, y: 0},
                {x: imageWidth + shift, y: canvas.height},
                {x: 0, y: canvas.height}
            ];
        }
    }

    function drawDividers() {
        ctx.fillStyle = 'white';
        for (let i = 1; i < 3; i++) {
            const x = i * config.imageWidth - config.shift;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + config.dividerWidth, 0);
            ctx.lineTo(x + config.dividerWidth - config.shift, canvas.height);
            ctx.lineTo(x - config.shift, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
    }
});