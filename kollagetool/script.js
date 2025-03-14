let isDragging = false;

function swapSite() {
    document.body.classList.add("fadeOutAnimation");
    setTimeout(() => {
      window.location.href = "https://bearwolf.github.io/bearwolf/chooseyourdestiny/";
    }, 900); //window.location.href = 'http://127.0.0.1:8080/storytool2024/';
  }
  function swapSite2() {
    document.body.classList.add("fadeOutAnimation");
    setTimeout(() => {
      window.location.href = "https://bearwolf.github.io/bearwolf/chooseyourdestiny/";
    }, 900); //window.location.href = 'http://127.0.0.1:8080/storytool2024/';
  }


document.addEventListener('DOMContentLoaded', () => {
    const fileInputs = [
        document.getElementById('file1'),
        document.getElementById('file2'),
        document.getElementById('file3'),
        document.getElementById('file4')
    ];
    const bulkUploadInput = document.getElementById('bulkUpload');
    const zoomInputs = [
        document.getElementById('zoom1'),
        document.getElementById('zoom2'),
        document.getElementById('zoom3'),
        document.getElementById('zoom4')
    ];
    const imageCountSelector = document.getElementById('imageCount');
    const canvas = document.getElementById('collageCanvas');
    const ctx = canvas.getContext('2d');
    const downloadLink = document.getElementById('downloadLink');

    // Set canvas size to 1920x1080
    canvas.width = 1920;
    canvas.height = 1080;

    // Collage configuration
    const config = {
        dividerWidth: 5, // Bredd på avdelarna i pixlar - justera detta värde för att ändra bredden
        angle: Math.PI / 24, // 7.5 grader - hälften så stor lutning
        totalSections: 3,
        
        // JUSTERA DESSA VÄRDEN FÖR ATT ÄNDRA BESKÄRNINGARNA
        // Värden i pixlar från vänster kant vid övre kanten (y=0)
        cut1: 695  , // Var beskärningen mellan bild 1 och 2 börjar
        cut2: 1367  , // Var beskärningen mellan bild 2 och 3 börjar
        cut3: 1920,
        
        // Avdelare justeringar
        divider1X: 695  , // X-position för första avdelaren
        divider2X: 1367  , // X-position för andra avdelaren
        divider3X: 2920,
        
        // JUSTERA DESSA VÄRDEN FÖR ATT ÄNDRA HUR LÅNGT BILDERNA KAN FLYTTAS
        // Värden i procent (0.0 - 1.0) av maximal möjlig förflyttning
        // 1.0 = full förflyttning, 0.5 = halv förflyttning, 0.0 = ingen förflyttning
        marginFactor1: 1.0, // Förflyttningsfaktor för bild 1
        marginFactor2: 1.0, // Förflyttningsfaktor för bild 2
        marginFactor3: 1.0,  // Förflyttningsfaktor för bild 3
        marginFactor4: 1.0,
        
        // Zoom-inställningar
        zoomRange: 5.0, // Hur mycket man kan zooma in relativt till minScale (2.0 = dubbelt så mycket)
        layouts: {
            2: {
                cuts: [1030, 2090, 9000 ],
                dividers: [1030, 2090, 9000]
            },
            3: {
                cuts: [695, 1367, 9000],
                dividers: [695, 1367, 9000]
            },
            4: {
                cuts: [550, 1030, 1510, 1920],
                dividers: [550, 1030, 1510, 1920]
            }
        }
    };

    // Beräkna förskjutningen baserat på vinkeln
    config.shift = Math.tan(config.angle) * canvas.height;
    
    // Varje sektion har samma basbredd (ett tredjedelar av canvasen)
    config.sectionPositions = [
        0,
        config.cut1, 
        config.cut2
    ];

    // Avdelarna placeras precis mellan sektionerna
    config.dividerPositions = [
        config.cut1 - config.dividerWidth/2,
        config.cut2 - config.dividerWidth/2
    ];

    // Predefined image sources
    const defaultImageSources = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg'];

    const images = [];
    let draggingIndex = -1;
    let dragStartX, dragStartY;

    // Load default images and create initial collage
    loadImagesAndCreateCollage(defaultImageSources);

    // Add event listener for bulk upload
    bulkUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileCount = e.target.files.length;
            // Begränsa till max 4 bilder och sätt rätt antal sektioner
            const selectedFiles = Array.from(e.target.files).slice(0, 4);
            
            // Sätt rätt antal sektioner baserat på antal valda filer
            const sectionCount = Math.min(Math.max(2, fileCount), 4);
            const layout = config.layouts[sectionCount];
            
            if (layout) {
                config.totalSections = sectionCount;
                config.cut1 = layout.cuts[0];
                config.cut2 = layout.cuts[1];
                config.cut3 = layout.cuts[2];
                
                config.divider1X = layout.dividers[0];
                config.divider2X = layout.dividers[1];
                config.divider3X = layout.dividers[2];
            }
            
            // Rensa befintliga bilder
            images.length = 0;
            
            // Uppdatera UI för rätt antal bilder
            updateUIForImageCount(sectionCount);
            imageCountSelector.value = sectionCount;
            
            // Ladda de nya bilderna
            Promise.all(selectedFiles.map((file, index) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const minScale = canvas.height / img.height;
                        const maxScale = minScale * config.zoomRange;
                        const scale = minScale;
                        
                        img.scale = scale;
                        img.minScale = minScale;
                        img.maxScale = maxScale;
                        img.offsetX = 0;
                        img.offsetY = 0;
                        
                        if (index < fileInputs.length) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInputs[index].files = dataTransfer.files;
                        }
                        
                        resolve(img);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });
            })).then(loadedImages => {
                images.push(...loadedImages);
                
                // Vänta med att rita tills alla bilder är laddade
                if (images.length < sectionCount) {
                    return loadRemainingDefaultImages(images.length, sectionCount);
                }
                return Promise.resolve();
            }).then(() => {
                // Nu när alla bilder är laddade kan vi rita
                updateZoomInputs();
                drawCollage(true);
            }).catch(error => {
                console.error('Error loading images:', error);
            });
        }
    });

    // Funktion för att ladda återstående standardbilder om färre än 3 bilder valdes
    function loadRemainingDefaultImages(startIndex, totalNeeded) {
        const remainingImages = defaultImageSources.slice(startIndex, totalNeeded);
        
        return Promise.all(remainingImages.map((src, index) => {
            const actualIndex = startIndex + index;
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const minScale = canvas.height / img.height;
                    const maxScale = minScale * config.zoomRange;
                    const scale = minScale;
                    
                    img.scale = scale;
                    img.minScale = minScale;
                    img.maxScale = maxScale;
                    img.offsetX = 0;
                    img.offsetY = 0;
                    resolve(img);
                };
                img.onerror = reject;
                img.src = src;
            });
        })).then(loadedImages => {
            images.push(...loadedImages);
        });
    }

    // Add event listener for file inputs
    fileInputs.forEach((input, index) => {
        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const img = new Image();
                img.onload = () => {
                    // Beräkna minsta skalfaktor för att täcka canvas-höjden
                    const minScale = canvas.height / img.height;
                    
                    // Beräkna maxScale baserat på minScale och zoomRange
                    const maxScale = minScale * config.zoomRange;
                    
                    // Sätt skalan till minScale som startläge
                    const scale = minScale;
                    
                    // Spara bilden med rätt skala och begränsningar
                    images[index] = img;
                    images[index].scale = scale;
                    images[index].minScale = minScale; // Spara minsta skalan
                    images[index].maxScale = maxScale; // Spara största skalan
                    images[index].offsetX = 0;
                    images[index].offsetY = 0;
                    
                    // Uppdatera UI och rita om
                    updateZoomInputs();
                    drawCollage(true);
                };
                img.src = URL.createObjectURL(e.target.files[0]);
            }
        });
    });

    // Add event listeners for zoom inputs
    zoomInputs.forEach((input, index) => {
        input.step = "0.01";
        
        input.addEventListener('input', (e) => {
            if (images[index]) {
                const minScale = images[index].minScale || 1.0;
                const oldScale = images[index].scale || 1.0; // Spara gamla skalan innan vi ändrar
                images[index].scale = Math.max(minScale, parseFloat(e.target.value));
                
                if (images[index].scale !== parseFloat(e.target.value)) {
                    input.value = images[index].scale;
                }
                
                // Försäkra oss om att adjustImagePosition alltid anropas med rätt värden
                adjustImagePosition(images[index], index, oldScale);
                drawCollage(false);
            }
        });
        
        input.addEventListener('change', (e) => {
            if (images[index]) {
                const minScale = images[index].minScale || 1.0;
                const oldScale = images[index].scale || 1.0; // Spara gamla skalan innan vi ändrar
                images[index].scale = Math.max(minScale, parseFloat(e.target.value));
                
                if (images[index].scale !== parseFloat(e.target.value)) {
                    input.value = images[index].scale;
                }
                
                // Försäkra oss om att adjustImagePosition alltid anropas med rätt värden
                adjustImagePosition(images[index], index, oldScale);
                downloadLink.href = canvas.toDataURL('image/png');
                downloadLink.style.display = 'inline-block';
            }
        });
    });

    imageCountSelector.addEventListener('change', (e) => {
        const selectedCount = parseInt(e.target.value);
        const layout = config.layouts[selectedCount];
        
        if (layout) {
            config.totalSections = selectedCount;
            config.cut1 = layout.cuts[0];
            config.cut2 = layout.cuts[1];
            config.cut3 = layout.cuts[2];
            
            config.divider1X = layout.dividers[0];
            config.divider2X = layout.dividers[1];
            config.divider3X = layout.dividers[2];
            images.forEach((img, index) => {
                if (img && index < selectedCount) {
                    adjustImagePosition(img, index, img.scale || 1.0);
                }
            });
        }
        
        updateUIForImageCount(selectedCount);
        drawCollage(true);
    });

    function updateUIForImageCount(count) {
        fileInputs.forEach((input, index) => {
            input.closest('.input-group').style.display = index < count ? 'flex' : 'none';
        });
        zoomInputs.forEach((input, index) => {
            input.closest('.zoom-container').style.display = index < count ? 'flex' : 'none';
        });
    
        // Uppdatera synligheten för swap-knappar
        document.querySelectorAll('.swap-btn').forEach(button => {
            const fromIndex = parseInt(button.dataset.from);
            const toIndex = parseInt(button.dataset.to);
            
            // Visa knappen endast om både från- och till-index är mindre än antalet sektioner
            button.style.display = (fromIndex < count && toIndex < count) ? 'inline-block' : 'none';
        });
    }

    // Add mouse handlers for canvas
    canvas.addEventListener('mousedown', startDragging);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);

    document.addEventListener('mousemove', preventDefaultIfDragging);
    document.addEventListener('mouseup', stopDragging);

    function startDragging(e) {
        e.preventDefault();
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Konvertera klickposition till canvas-koordinater
        const canvasX = x * (canvas.width / rect.width);
        const canvasY = y * (canvas.height / rect.height);
        
        // Beräkna förskjutning vid aktuell y-position baserat på lutningen
        const shiftAtY = (canvasY / canvas.height) * config.shift;
        
        // Identifiera vilken sektion användaren klickade på med hänsyn till diagonal beskärning
        if (canvasX < (config.cut1 - shiftAtY)) {
            draggingIndex = 0;
        } else if (canvasX < (config.cut2 - shiftAtY)) {
            draggingIndex = 1;
        } else if (canvasX < (config.cut3 - shiftAtY)) {
            draggingIndex = 2;
        } else {
            draggingIndex = 3;
        }
        
        if (draggingIndex >= 0 && draggingIndex < images.length) {
            dragStartX = x;
            dragStartY = y;
        }
    }

    function drag(e) {
        if (!isDragging || draggingIndex === -1) return;

        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - dragStartX;
        const dy = y - dragStartY;

        const img = images[draggingIndex];
        const newOffsetX = (img.offsetX || 0) + dx;
        const newOffsetY = (img.offsetY || 0) + dy;

        // Säkerställ att skalan inte är mindre än minScale
        const minScale = img.minScale || 1.0;
        if ((img.scale || 1) < minScale) {
            img.scale = minScale;
            // Uppdatera zoom-reglaget om skalan ändrades
            zoomInputs[draggingIndex].value = minScale;
        }

        // Beräkna sektionsbredd baserat på index
        let sectionWidth;
        if (draggingIndex === 0) {
            sectionWidth = config.cut1;
        } else if (draggingIndex === 1) {
            sectionWidth = config.cut2 - config.cut1 + 290;
        } else if (draggingIndex === 2) {
            if (config.totalSections === 3) {
                sectionWidth = canvas.width - config.cut2 + 290; // För 3 bilder
            } else {
                sectionWidth = config.cut3 - config.cut2 + 290;  // För 4 bilder
            }
        } else if (draggingIndex === 3) {
            sectionWidth = canvas.width - config.cut3 + 290;  // För fjärde bilden
        }

        // Calculate constraints
        const scale = img.scale || 1;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const maxOffsetX = Math.max(0, (scaledWidth - sectionWidth) / 2);
        const maxOffsetY = Math.max(0, (scaledHeight - canvas.height) / 2);
        
        // Hämta rätt marginalfaktor baserat på bildindex
        let marginFactor;
        if (draggingIndex === 0) {
            marginFactor = config.marginFactor1;
        } else if (draggingIndex === 1) {
            marginFactor = config.marginFactor2;
        } else {
            marginFactor = config.marginFactor3;
        }

        // Apply constraints with margin factor
        const adjustedMaxOffsetX = maxOffsetX * marginFactor;
        img.offsetX = Math.max(-adjustedMaxOffsetX, Math.min(adjustedMaxOffsetX, newOffsetX));
        img.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY));

        dragStartX = x;
        dragStartY = y;

        drawCollage();
    }

    function stopDragging(e) {
        if (isDragging) {
            if (e) e.preventDefault();
            if (draggingIndex !== -1) {
                snapToGrid();
                downloadLink.href = canvas.toDataURL('image/png');
                downloadLink.style.display = 'inline-block';
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

    function snapToGrid() {
        const snapIncrement = 10;
        images.forEach((img, index) => {
            // Säkerställ att skalan inte är mindre än minScale
            const minScale = img.minScale || 1.0;
            if ((img.scale || 1) < minScale) {
                img.scale = minScale;
                // Uppdatera zoom-reglaget om skalan ändrades
                zoomInputs[index].value = minScale;
            }
            
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
                    // Beräkna minsta skalfaktor för att täcka canvas-höjden
                    const minScale = canvas.height / img.height;
                    
                    // Beräkna maxScale baserat på minScale och zoomRange
                    const maxScale = minScale * config.zoomRange;
                    
                    // Sätt skalan till minScale som startläge
                    const scale = minScale;
                    
                    img.scale = scale;
                    img.minScale = minScale; // Spara minsta skalan
                    img.maxScale = maxScale; // Spara största skalan
                    img.offsetX = 0;
                    img.offsetY = 0;
                    resolve(img);
                };
                img.onerror = reject;
                img.src = src;
            });
        })).then(loadedImages => {
            images.push(...loadedImages);
            updateZoomInputs(); // Uppdatera zoom-inputs först
            drawCollage(true);
        });
    }

    function updateZoomInputs() {
        zoomInputs.forEach((input, index) => {
            if (images[index]) {
                // Säkerställ att bilden har rätt skala
                const minScale = images[index].minScale || 1.0;
                const maxScale = images[index].maxScale || (minScale * config.zoomRange);
                
                // Uppdatera min och max för input-elementet
                input.min = minScale;
                input.max = maxScale;
                
                // Säkerställ att skalan är inom gränserna
                images[index].scale = Math.max(minScale, Math.min(maxScale, images[index].scale || minScale));
                
                // Uppdatera input-värdet med aktuell skala
                input.value = images[index].scale;
            }
        });
    }

    function drawCollage(updateDownloadLink = false) {
        // Clear main canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Rita bara de bilder som faktiskt finns
        images.forEach((img, index) => {
            if (img && index < config.totalSections) {
                drawImage(img, index);
            }
        });
    
        // Rita transparenta avdelare
        drawDividers();
    
        if (updateDownloadLink) {
            downloadLink.href = canvas.toDataURL('image/png');
            downloadLink.style.display = 'inline-block';
        }
    }

    function drawImage(img, index) {
        // Säkerställ att bilden har rätt skala innan vi ritar
        const minScale = img.minScale || 1.0;
        if ((img.scale || 1) < minScale) {
            img.scale = minScale;
            // Uppdatera zoom-reglaget om skalan ändrades
            zoomInputs[index].value = minScale;
        }
        
        // Skapa en offscreen-canvas för att rita och beskära bilden
        const offCanvas = document.createElement('canvas');
        
        // Anpassa canvas-storlek och klippning baserat på bildindex
        let clipPath = [];
        
        if (index === 0) {
            // Första bilden
            offCanvas.width = config.cut1 + 0; // Lite extra marginal
            offCanvas.height = canvas.height;
            
            // Klippningskoordinater för första bilden
            clipPath = [
                {x: 0, y: 0}, // Övre vänstra hörnet
                {x: config.cut1, y: 0}, // Övre högra hörnet
                {x: config.cut1 - config.shift, y: canvas.height}, // Nedre högra hörnet (med förskjutning)
                {x: 0, y: canvas.height} // Nedre vänstra hörnet
            ];
        } else if (index === 1) {
            // Andra bilden
            offCanvas.width = config.cut2 - config.cut1 + 2 * config.shift + 0; // Extra utrymme
            offCanvas.height = canvas.height;
            
            // Klippningskoordinater för andra bilden
            clipPath = [
                {x: config.shift, y: 0}, // Övre vänstra hörnet (med förskjutning)
                {x: offCanvas.width - config.shift, y: 0}, // Övre högra hörnet
                {x: offCanvas.width - 2 * config.shift, y: canvas.height}, // Nedre högra hörnet
                {x: 0, y: canvas.height} // Nedre vänstra hörnet
            ];
        } else if (index === 2) {
            // Tredje bilden
            if (config.totalSections === 3) {
                // För 3-bildsläget
                offCanvas.width = canvas.width - config.cut2 + config.shift + 150;
                clipPath = [
                    {x: config.shift, y: 0},
                    {x: offCanvas.width, y: 0},
                    {x: offCanvas.width, y: canvas.height},
                    {x: 0, y: canvas.height}
                ];
            } else {
                // För 4-bildsläget
                offCanvas.width = config.cut3 - config.cut2 + 2 * config.shift + 0;
                clipPath = [
                    {x: config.shift, y: 0},
                    {x: offCanvas.width - config.shift, y: 0},
                    {x: offCanvas.width - 2 * config.shift, y: canvas.height},
                    {x: 0, y: canvas.height}
                ];
            }
            offCanvas.height = canvas.height;
        } else if (index === 3) {
            // Fjärde bilden (endast i 4-bildsläget)
            offCanvas.width = canvas.width - config.cut3 + config.shift + 150;
            offCanvas.height = canvas.height;
            clipPath = [
                {x: config.shift, y: 0},
                {x: offCanvas.width, y: 0},
                {x: offCanvas.width, y: canvas.height},
                {x: 0, y: canvas.height}
            ];
        }
        
        
        const offCtx = offCanvas.getContext('2d');
        
        // Skala och centrera bilden
        const scale = img.scale || 1;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Beräkna offset för centrering och användarjusteringar
        const xOffset = (offCanvas.width - scaledWidth) / 2 + (img.offsetX || 0);
        const yOffset = (offCanvas.height - scaledHeight) / 2 + (img.offsetY || 0);
        
        // Rita bilden på den tillfälliga canvasen
        offCtx.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);
        
        // Skapa mask för klippning
        offCtx.globalCompositeOperation = 'destination-in';
        offCtx.fillStyle = 'white';
        offCtx.beginPath();
        
        // Rita klippningsvägen
        clipPath.forEach((point, i) => {
            if (i === 0) offCtx.moveTo(point.x, point.y);
            else offCtx.lineTo(point.x, point.y);
        });
        
        offCtx.closePath();
        offCtx.fill();
        
        // Rita den beskurna bilden på huvudcanvasen
        // Placera bilden baserat på index
        let destX;
        if (index === 0) {
            destX = 0;
        } else if (index === 1) {
            destX = config.cut1 - config.shift;
        } else if (index === 2) {
            destX = config.cut2 - config.shift;
        } else {
            destX = config.cut3 - config.shift;
        }
        
        ctx.drawImage(offCanvas, destX, 0);
    }

    function drawDividers() {
        // Använd globalCompositeOperation för att göra avdelarna transparenta
        ctx.globalCompositeOperation = 'destination-out';
        
        // Första avdelaren - använder config.divider1X
        let x1 = config.divider1X - config.dividerWidth/2;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.lineTo(x1 + config.dividerWidth, 0);
        ctx.lineTo(x1 + config.dividerWidth - config.shift, canvas.height);
        ctx.lineTo(x1 - config.shift, canvas.height);
        ctx.closePath();
        ctx.fill();
        
        // Andra avdelaren - använder config.divider2X
        let x2 = config.divider2X - config.dividerWidth/2;
        ctx.beginPath();
        ctx.moveTo(x2, 0);
        ctx.lineTo(x2 + config.dividerWidth, 0);
        ctx.lineTo(x2 + config.dividerWidth - config.shift, canvas.height);
        ctx.lineTo(x2 - config.shift, canvas.height);
        ctx.closePath();
        ctx.fill();

        if (config.totalSections > 2) {
            // Tredje avdelaren
            let x3 = config.divider3X - config.dividerWidth / 2;
            ctx.beginPath();
            ctx.moveTo(x3, 0);
            ctx.lineTo(x3 + config.dividerWidth, 0);
            ctx.lineTo(x3 + config.dividerWidth - config.shift, canvas.height);
            ctx.lineTo(x3 - config.shift, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
        
        // Återställ globalCompositeOperation till standardvärdet
        ctx.globalCompositeOperation = 'source-over';
    }
    document.querySelectorAll('.swap-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const fromIndex = parseInt(e.target.dataset.from);
            const toIndex = parseInt(e.target.dataset.to);
            swapImages(fromIndex, toIndex);
        });
    });
    function swapImages(index1, index2) {
        // Byt plats på bilderna i images-arrayen
        const tempImg = images[index1];
        images[index1] = images[index2];
        images[index2] = tempImg;
    
        // Byt plats på filerna i file inputs
        const tempFiles = fileInputs[index1].files;
        const dt1 = new DataTransfer();
        const dt2 = new DataTransfer();
        
        if (fileInputs[index2].files.length > 0) {
            dt1.items.add(fileInputs[index2].files[0]);
        }
        if (fileInputs[index1].files.length > 0) {
            dt2.items.add(fileInputs[index1].files[0]);
        }
        
        fileInputs[index1].files = dt1.files;
        fileInputs[index2].files = dt2.files;
    
        // Beräkna om skalorna för båda bilderna
        [index1, index2].forEach(index => {
            if (images[index]) {
                const minScale = canvas.height / images[index].height;
                const maxScale = minScale * config.zoomRange;
                images[index].minScale = minScale;
                images[index].maxScale = maxScale;
                images[index].scale = Math.max(minScale, images[index].scale || minScale);
            }
        });
    
        // Uppdatera zoom-inputs
        updateZoomInputs();
    
        // Rita om collaget
        drawCollage(true);
    }
    
    

    function adjustImagePosition(img, index, oldScale) {
        // Beräkna sektionsbredd baserat på index och totalt antal sektioner
        let sectionWidth;
        if (index === 0) {
            sectionWidth = config.cut1;
        } else if (index === 1) {
            sectionWidth = config.cut2 - config.cut1 + 270;
        } else if (draggingIndex === 2) {
            if (config.totalSections === 3) {
                sectionWidth = canvas.width - config.cut2 + 290; // För 3 bilder
            } else {
                sectionWidth = config.cut3 - config.cut2 + 290;  // För 4 bilder
            }
        } else if (draggingIndex === 3) {
            sectionWidth = canvas.width - config.cut3 + 290;  // För fjärde bilden
        
        }
        
        // Beräkna nya begränsningar baserat på aktuell skala
        const scale = img.scale || 1;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Om bilden har skalats ner, justera offsetX och offsetY proportionellt
        if (oldScale > scale) {
            // Justera offset proportionellt mot skalförändringen
            const ratio = scale / oldScale;
            img.offsetX = img.offsetX * ratio;
            img.offsetY = img.offsetY * ratio;
        }
        
        // Beräkna maximal offset baserat på bildens storlek och sektionsbredd
        const maxOffsetX = Math.max(0, (scaledWidth - sectionWidth) / 2);
        const maxOffsetY = Math.max(0, (scaledHeight - canvas.height) / 2);
        
        // Hämta rätt marginalfaktor baserat på bildindex
        let marginFactor;
        if (index === 0) {
            marginFactor = config.marginFactor1;
        } else if (index === 1) {
            marginFactor = config.marginFactor2;
        } else if (index === 2) {
            marginFactor = config.marginFactor3;
        } else {
            marginFactor = config.marginFactor4;
        }
        
        // Begränsa offset så att bilden alltid täcker sitt område, justerat med marginalfaktorn
        const adjustedMaxOffsetX = maxOffsetX * marginFactor;
        img.offsetX = Math.max(-adjustedMaxOffsetX, Math.min(adjustedMaxOffsetX, img.offsetX || 0));
        img.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, img.offsetY || 0));
    }
});