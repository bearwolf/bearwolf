let isDragging = false;
function initializeImageAdjustments(img, index) {
    img.exposure = 0;
    img.temperature = 0;
    img.contrast = 0;
    img.saturation = 0;
}
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
                        initializeImageAdjustments(img, index);
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
    document.querySelectorAll('.adjust-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            const adjust = parseInt(e.target.dataset.adjust);
            const controlGroup = e.target.closest('.control-group');
            const index = parseInt(controlGroup.dataset.index);
            
            if (images[index]) {
                // Justera värdet
                const step = {
                    exposure: 2,    // Steg för exponering
                    temperature: 2, // Steg för temperatur
                    contrast: 2,    // Steg för kontrast
                    saturation: 2   // Steg för mättnad
                };
                
                images[index][type] = (images[index][type] || 0) + (adjust * step[type]);
                
                // Begränsa värdena
                const limits = {
                    exposure: [-100, 100],
                    temperature: [-100, 100],
                    contrast: [-100, 100],
                    saturation: [-100, 100]
                };
                
                images[index][type] = Math.max(
                    limits[type][0], 
                    Math.min(limits[type][1], images[index][type])
                );
                
                const displayClass = type === 'temperature' ? 'temp-value' : `${type}-value`;
                const displayElement = controlGroup.querySelector(`.${displayClass}`);
                if (displayElement) {
                    displayElement.textContent = images[index][type];
                }
                
                // Rita om collaget
                drawCollage(false);
            }
        });
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
                                    // Nollställ justeringsvärden
                images[index].exposure = 0;
                images[index].temperature = 0;
                images[index].contrast = 0;
                images[index].saturation = 0;

                // Uppdatera display-värdena
                const controlGroup = document.querySelector(`.control-group[data-index="${index}"]`);
                if (controlGroup) {
                    controlGroup.querySelector('.exposure-value').textContent = '0';
                    controlGroup.querySelector('.temp-value').textContent = '0';
                    controlGroup.querySelector('.contrast-value').textContent = '0';
                    controlGroup.querySelector('.saturation-value').textContent = '0';
                }
                    initializeImageAdjustments(images[index], index);
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
                images[index].scale = Math.round(Math.max(minScale, parseFloat(e.target.value)) * 100) / 100;
                
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
    
        const dx = Math.round(x - dragStartX);
        const dy = Math.round(y - dragStartY);
    
        const img = images[draggingIndex];
        
        // Spara de exakta värdena vi vill ha
        const exactOffsetX = Math.round((img.offsetX || 0) + dx);
        const exactOffsetY = Math.round((img.offsetY || 0) + dy);
    
        // Säkerställ att skalan inte är mindre än minScale
        const minScale = img.minScale || 1.0;
        if ((img.scale || 1) < minScale) {
            img.scale = minScale;
            zoomInputs[draggingIndex].value = minScale;
            adjustImagePosition(img, draggingIndex, img.scale); // Lägg till detta
        }
    
        // Beräkna sektionsbredd baserat på index
        let sectionWidth;
        if (draggingIndex === 0) {
            sectionWidth = config.cut1;
        } else if (draggingIndex === 1) {
            sectionWidth = config.cut2 - config.cut1 + 290;
        } else if (draggingIndex === 2) {
            if (config.totalSections === 3) {
                sectionWidth = canvas.width - config.cut2 + 290;
            } else {
                sectionWidth = config.cut3 - config.cut2 + 290;
            }
        } else if (draggingIndex === 3) {
            sectionWidth = canvas.width - config.cut3 + 290;
        }
    
        // Calculate constraints
        const scale = Math.round((img.scale || 1) * 1000) / 1000;
        const scaledWidth = Math.round(img.width * scale);
        const scaledHeight = Math.round(img.height * scale);
        const maxOffsetX = Math.round(Math.max(0, (scaledWidth - sectionWidth) / 2));
        const maxOffsetY = Math.round(Math.max(0, (scaledHeight - canvas.height) / 2));
        
        // Hämta rätt marginalfaktor
        let marginFactor;
        if (draggingIndex === 0) {
            marginFactor = config.marginFactor1;
        } else if (draggingIndex === 1) {
            marginFactor = config.marginFactor2;
        } else {
            marginFactor = config.marginFactor3;
        }
    
        // Sätt de slutliga värdena med begränsningar
        const adjustedMaxOffsetX = Math.round(maxOffsetX * marginFactor);
        img.offsetX = Math.round(Math.max(-adjustedMaxOffsetX, Math.min(adjustedMaxOffsetX, exactOffsetX)));
        img.offsetY = Math.round(Math.max(-maxOffsetY, Math.min(maxOffsetY, exactOffsetY)));
    
        // Spara de validerade värdena
        img.lastValidX = img.offsetX;
        img.lastValidY = img.offsetY;
    
        dragStartX = x;
        dragStartY = y;
    
        console.log('Drag values:', {
            index: draggingIndex,
            exactX: exactOffsetX,
            exactY: exactOffsetY,
            finalX: img.offsetX,
            finalY: img.offsetY
        });
    
        drawCollage();
    }
    
    

    function stopDragging(e) {
        if (isDragging) {
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
        if (!sources || !Array.isArray(sources)) {
            console.error('Invalid sources provided to loadImagesAndCreateCollage');
            return;
        }
    
        Promise.all(sources.map((source, sourceIndex) => {
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
                    img.exposure = 0;    // Initiera exponering
                    img.temperature = 0;  // Initiera temperatur
                    
                    resolve(img);
                };
                img.onerror = reject;
                img.src = source;  // Använd source istället för src
            });
        })).then(loadedImages => {
            images.push(...loadedImages);
            updateZoomInputs();
            drawCollage(true);
        }).catch(error => {
            console.error('Error loading images:', error);
        });
    }
    


    zoomInputs.forEach((input, index) => {
        input.step = "0.01";
        
        input.addEventListener('input', (e) => {
            if (images[index]) {
                const minScale = images[index].minScale || 1.0;
                const oldScale = images[index].scale || 1.0; // Spara gamla skalan
                images[index].scale = Math.max(minScale, parseFloat(e.target.value));
                
                if (images[index].scale !== parseFloat(e.target.value)) {
                    input.value = images[index].scale;
                }
                
                adjustImagePosition(images[index], index, oldScale);
                drawCollage(false);
            }
        });
        
        input.addEventListener('change', (e) => {
            if (images[index]) {
                const minScale = images[index].minScale || 1.0;
                const oldScale = images[index].scale || 1.0;
                images[index].scale = Math.max(minScale, parseFloat(e.target.value));
                
                if (images[index].scale !== parseFloat(e.target.value)) {
                    input.value = images[index].scale;
                }
                
                adjustImagePosition(images[index], index, oldScale);
                downloadLink.href = canvas.toDataURL('image/png');
                downloadLink.style.display = 'inline-block';
            }
        });
    });

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
        // Logga ursprungliga värden
        console.log('Initial values:', {
            index: index,
            rawScale: img.scale,
            rawOffsetX: img.offsetX,
            rawOffsetY: img.offsetY
        });
    
        // Säkerställ att bilden har rätt skala innan vi ritar
        const minScale = img.minScale || 1.0;
        if ((img.scale || 1) < minScale) {
            img.scale = minScale;
            zoomInputs[index].value = minScale;
        }
        
        // Skapa en offscreen-canvas för att rita och beskära bilden
        const offCanvas = document.createElement('canvas');
        
        // Anpassa canvas-storlek och klippning baserat på bildindex
        let clipPath = [];
        
        if (index === 0) {
            offCanvas.width = config.cut1 + 0;
            offCanvas.height = canvas.height;
            clipPath = [
                {x: 0, y: 0},
                {x: config.cut1, y: 0},
                {x: config.cut1 - config.shift, y: canvas.height},
                {x: 0, y: canvas.height}
            ];
        } else if (index === 1) {
            offCanvas.width = config.cut2 - config.cut1 + 2 * config.shift + 0;
            offCanvas.height = canvas.height;
            clipPath = [
                {x: config.shift, y: 0},
                {x: offCanvas.width - config.shift, y: 0},
                {x: offCanvas.width - 2 * config.shift, y: canvas.height},
                {x: 0, y: canvas.height}
            ];
        } else if (index === 2) {
            if (config.totalSections === 3) {
                offCanvas.width = canvas.width - config.cut2 + config.shift + 150;
                clipPath = [
                    {x: config.shift, y: 0},
                    {x: offCanvas.width, y: 0},
                    {x: offCanvas.width, y: canvas.height},
                    {x: 0, y: canvas.height}
                ];
            } else {
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
        
        // Beräkna skalning och position med detaljerad logging
        img.scale = Math.round(img.scale * 1000) / 1000;
        
        // Beräkna skalade dimensioner
        const rawScaledWidth = img.width * img.scale;
        const rawScaledHeight = img.height * img.scale;
        console.log('Raw scaled dimensions:', {
            index: index,
            rawScaledWidth,
            rawScaledHeight
        });
    
        const scaledWidth = Math.round(rawScaledWidth);
        const scaledHeight = Math.round(rawScaledHeight);
    
        // Beräkna centrering FÖRE avrundning
        const rawCenteringOffsetX = (offCanvas.width - scaledWidth) / 2;
        console.log('Raw centering offset:', {
            index: index,
            rawCenteringOffsetX,
            canvasWidth: offCanvas.width,
            scaledWidth
        });
    
        // Avrunda centeringOffset separat
        const centeringOffsetX = Math.round(rawCenteringOffsetX);
        const xOffset = centeringOffsetX + (img.lastValidX || Math.round(img.offsetX || 0));
        const yOffset = Math.round((offCanvas.height - scaledHeight) / 2) + (img.lastValidY || Math.round(img.offsetY || 0));
    
        console.log('Final calculations:', {
            index: index,
            centeringOffsetX,
            userOffsetX: img.offsetX,
            finalXOffset: xOffset,
            finalYOffset: yOffset
        });
    
        // 1. RITA ORIGINALBILDEN FÖRST
        offCtx.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);
    
        // 2. APPLICERA EXPONERING OCH ANDRA FILTER
        const filters = [];
        if (img.exposure !== undefined && img.exposure !== 0) {
            filters.push(`brightness(${100 + (img.exposure * 0.5)}%)`);
        }
        if (img.contrast !== undefined && img.contrast !== 0) {
            filters.push(`contrast(${100 + img.contrast}%)`);
        }
        if (img.saturation !== undefined && img.saturation !== 0) {
            filters.push(`saturate(${100 + img.saturation}%)`);
        }
        
        if (filters.length > 0) {
            offCtx.filter = filters.join(' ');
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = offCanvas.width;
            tempCanvas.height = offCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.filter = offCtx.filter;
            tempCtx.drawImage(offCanvas, 0, 0);
            offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
            offCtx.drawImage(tempCanvas, 0, 0);
        }
    
        // 3. APPLICERA TEMPERATUR
        if (img.temperature !== undefined && img.temperature !== 0) {
            const tempValue = img.temperature;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = offCanvas.width;
            tempCanvas.height = offCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.drawImage(offCanvas, 0, 0);
            
            if (tempValue > 0) {
                tempCtx.fillStyle = `rgba(255, 140, 0, ${tempValue / 200})`;
            } else {
                tempCtx.fillStyle = `rgba(0, 70, 255, ${Math.abs(tempValue) / 200})`;
            }
            tempCtx.globalCompositeOperation = 'overlay';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
            offCtx.drawImage(tempCanvas, 0, 0);
        }
    
        // 4. APPLICERA KLIPPMASK
        offCtx.globalCompositeOperation = 'destination-in';
        offCtx.fillStyle = 'white';
        offCtx.beginPath();
        clipPath.forEach((point, i) => {
            if (i === 0) offCtx.moveTo(point.x, point.y);
            else offCtx.lineTo(point.x, point.y);
        });
        offCtx.closePath();
        offCtx.fill();
    
        // 5. RITA PÅ HUVUDCANVAS PÅ RÄTT POSITION
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
    
    
    
    function calculateColorMatrix(temperature) {
        const t = temperature / 100;
        return [
            1 + (t > 0 ? t * 0.1 : 0), 0, 0, 0, 0,  // R
            0, 1, 0, 0, 0,                           // G
            0, 0, 1 + (t < 0 ? t * 0.1 : 0), 0, 0,  // B
            0, 0, 0, 1, 0                            // A
        ];
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
        [index1, index2].forEach(index => {
            const controlGroup = document.querySelector(`.control-group[data-index="${index}"]`);
            if (controlGroup && images[index]) {
                // Uppdatera exponering
                controlGroup.querySelector('.exposure-value').textContent = 
                    images[index].exposure || '0';
                
                // Uppdatera temperatur
                controlGroup.querySelector('.temp-value').textContent = 
                    images[index].temperature || '0';
                
                // Uppdatera kontrast
                controlGroup.querySelector('.contrast-value').textContent = 
                    images[index].contrast || '0';
                
                // Uppdatera mättnad
                controlGroup.querySelector('.saturation-value').textContent = 
                    images[index].saturation || '0';
            }
        });
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
    
    // Lägg till dessa egenskaper till varje bild-objekt
function initializeImageAdjustments(img, index) {
    img.exposure = 0;
    img.temperature = 0;
}

function adjustTemperature(imageData, temperature) {
    const t = temperature / 100; // Normalisera till -1 till 1
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // Röd kanal
        if (t > 0) {
            data[i] = Math.min(255, data[i] + (t * 50)); // Öka rött för varmare
        }
        
        // Blå kanal
        if (t < 0) {
            data[i + 2] = Math.min(255, data[i + 2] + (Math.abs(t) * 50)); // Öka blått för kallare
        }
        
        // Justera motsatt kanal för bättre balans
        if (t > 0) {
            data[i + 2] = Math.max(0, data[i + 2] - (t * 30)); // Minska blått för varmare
        } else {
            data[i] = Math.max(0, data[i] - (Math.abs(t) * 30)); // Minska rött för kallare
        }
    }
}

document.querySelectorAll('.exposure-control').forEach(control => {
    control.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (images[index]) {
            images[index].exposure = parseInt(e.target.value);
            drawCollage(false);
        }
    });
    
    control.addEventListener('change', () => {
        drawCollage(true);
    });
});

document.querySelectorAll('.temperature-control').forEach(control => {
    control.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);

        if (images[index]) {
            images[index].temperature = parseInt(e.target.value);
            console.log('Temperature set on image:', {
                index: index,
                temperature: images[index].temperature,
                imageProperties: Object.keys(images[index])
            });
            drawCollage(false);
        }
    });
    
    control.addEventListener('change', () => {
        drawCollage(true);
    });
});

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

function adjustImagePosition(img, index, oldScale) {
    // Beräkna sektionsbredd baserat på index
    let sectionWidth;
    if (index === 0) {
        sectionWidth = config.cut1;
    } else if (index === 1) {
        sectionWidth = config.cut2 - config.cut1 + 290;
    } else if (index === 2) {
        if (config.totalSections === 3) {
            sectionWidth = canvas.width - config.cut2 + 290;
        } else {
            sectionWidth = config.cut3 - config.cut2 + 290;
        }
    } else if (index === 3) {
        sectionWidth = canvas.width - config.cut3 + 290;
    }

    const scale = Math.round((img.scale || 1) * 1000) / 1000;
    const scaledWidth = Math.round(img.width * scale);
    const scaledHeight = Math.round(img.height * scale);
    const maxOffsetX = Math.round(Math.max(0, (scaledWidth - sectionWidth) / 2));
    const maxOffsetY = Math.round(Math.max(0, (scaledHeight - canvas.height) / 2));

    // Hämta rätt marginalfaktor
    let marginFactor;
    if (index === 0) {
        marginFactor = config.marginFactor1;
    } else if (index === 1) {
        marginFactor = config.marginFactor2;
    } else {
        marginFactor = config.marginFactor3;
    }

    // Justera offset proportionellt mot skalförändringen
    if (oldScale && oldScale !== scale) {
        const ratio = scale / oldScale;
        img.offsetX = Math.round(img.offsetX * ratio);
        img.offsetY = Math.round(img.offsetY * ratio);
    }

    // Applicera begränsningar
    const adjustedMaxOffsetX = Math.round(maxOffsetX * marginFactor);
    img.offsetX = Math.round(Math.max(-adjustedMaxOffsetX, Math.min(adjustedMaxOffsetX, img.offsetX)));
    img.offsetY = Math.round(Math.max(-maxOffsetY, Math.min(maxOffsetY, img.offsetY)));

    // Spara de validerade värdena
    img.lastValidX = img.offsetX;
    img.lastValidY = img.offsetY;
}
});