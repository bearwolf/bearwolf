// Global variables
const contentArea = document.getElementById('content-area');
const buttons = document.querySelectorAll('.menu-button');
const menuItems = document.querySelectorAll('.menu-item');

// Load initial page when document is ready
document.addEventListener('DOMContentLoaded', function() {
    loadContent('home'); // Load home page initially
    createSteppedGradient();

    // Add click event handlers for each button
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            buttons.forEach(btn => btn.classList.remove('active')); // Remove active class from all buttons
            this.classList.add('active'); // Add active class to clicked button
            
            const section = this.getAttribute('data-section');
            loadContent(section); // Update content area
            
            updateCursorVisibility(); // Update cursor visibility
            playMenuSound(); // Play menu sound
            
            // Scroll to content area on mobile
            if (window.innerWidth <= 600) {
                setTimeout(() => {
                    contentArea.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    });
    
    // Handle hover for menu items
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            menuItems.forEach(mi => mi.classList.remove('show-cursor')); // Remove cursor from all items
            this.classList.add('show-cursor'); // Add cursor to current item
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('show-cursor'); // Remove cursor from this item
            updateCursorVisibility(); // Show cursor on active button
        });
    });
    
    // Clear all cursor texts
    document.querySelectorAll('.cursor').forEach(cursor => {
        cursor.textContent = '';
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', handleKeyNavigation);
    
    // Initial cursor visibility update
    updateCursorVisibility();
});

// Update cursor visibility based on active button
function updateCursorVisibility() {
    menuItems.forEach(item => item.classList.remove('show-cursor')); // Clear cursor from all items
    
    const activeButton = document.querySelector('.menu-button.active');
    if (activeButton) {
        const activeItem = activeButton.closest('.menu-item');
        if (activeItem) {
            activeItem.classList.add('show-cursor'); // Show cursor on active item
        }
    }
}

// Load content based on section
function loadContent(section) {
    const oldContent = contentArea.innerHTML; // Spara gammalt innehåll
    
    fetch(`content/${section}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Använd övergångseffekten istället för direkt byte
            createRPGTransitionEffect(oldContent, html);
        })
        .catch(error => {
            console.error('Error loading content:', error);
            contentArea.innerHTML = '<p>Error loading content. Please try again.</p>';
        });
}

// Play menu sound (placeholder for actual sound implementation)
function playMenuSound() {
    console.log('Menu sound played');
}

// Handle keyboard navigation
function handleKeyNavigation(e) {
    const activeButton = document.querySelector('.menu-button.active');
    const menuItems = Array.from(document.querySelectorAll('.menu-item'));
    const currentIndex = menuItems.findIndex(item => 
        item.querySelector('.menu-button') === activeButton);
    
    let nextIndex = currentIndex;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
            nextIndex = Math.max(0, currentIndex - 1);
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 'ArrowRight':
            nextIndex = Math.min(menuItems.length - 1, currentIndex + 1);
            e.preventDefault();
            break;
        case 'Enter':
        case ' ':
            activeButton.click();
            e.preventDefault();
            break;
    }
    
    if (nextIndex !== currentIndex) {
        menuItems[nextIndex].querySelector('.menu-button').click();
        updateCursorVisibility();
    }
}



function createSteppedGradient() {
    const container = document.getElementById('retro-gradient');
    if (!container) return; // Check if this condition might be causing issues
    
    container.innerHTML = ''; // Clear the container
    
    const colors = [
        '#7a79d6', '#6e6dca', '#6261be', '#5655b2', '#4a49a6',
        '#3e3d9a', '#32318e', '#262582', '#1a1976', '#0e0d6a',
        '#02015e', '#000052', '#00004a', '#000042', '#00003a',
        '#000038'
    ];
    
    colors.forEach((color, index) => {
        const step = document.createElement('div');
        step.style.position = 'absolute';
        step.style.left = '0';
        step.style.width = '100%';
        step.style.height = (100 / colors.length) + '%';
        step.style.top = (index * (100 / colors.length)) + '%';
        step.style.backgroundColor = color;
        
        container.appendChild(step);
    });
    
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
}



















// Funktion för att skapa en pixelerad övergångseffekt
function createRPGTransitionEffect(oldContent, newContent) {
    // Hämta position och dimensioner för contentArea
    const contentRect = contentArea.getBoundingClientRect();
    
    // Definiera marginaler för effektområdet
    const margin = {
        top: 6,
        right: -5,
        bottom: 6,
        left: 8
    };
    
    // Skapa en overlay som bara täcker contentArea men inte menyn, med extra marginaler
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = (contentRect.top + margin.top) + 'px';
    overlay.style.left = (contentRect.left + margin.left) + 'px';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none'; // Tillåt klick att passera igenom
    overlay.style.overflow = 'hidden'; // Begränsa innehåll till overlay
    
    // Anpassa overlay-storlek baserat på skärmstorlek och med dina önskade marginaler
    if (window.innerWidth <= 600) {
        // På mobil: menyn är längst ner, så begränsa höjden
        overlay.style.width = (contentRect.width - margin.left - margin.right) + 'px';
        overlay.style.height = (contentRect.height - 140 - margin.top - margin.bottom) + 'px'; // Exkludera menyns höjd + marginaler
    } else {
        // På desktop: menyn är till höger, så begränsa bredden
        overlay.style.width = (contentRect.width - 185 - margin.left - margin.right) + 'px'; // Exkludera menyns bredd (185px) + marginaler
        overlay.style.height = (contentRect.height - margin.top - margin.bottom) + 'px'; // Lägg till marginaler
    }
    
    // Skapa canvas för effekten
    const canvas = document.createElement('canvas');
    canvas.width = parseInt(overlay.style.width);
    canvas.height = parseInt(overlay.style.height);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Lägg till canvas i overlay
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
    
    // Spara aktuell scroll-position
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    // Starta övergångseffekten
    let progress = 0;
    const duration = 800; // ms
    const startTime = performance.now();
    let contentUpdated = false;
    
    // Animationsfunktion
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Uppdatera position ifall användaren scrollar under animationen
        overlay.style.top = (contentRect.top + window.scrollY - scrollY + margin.top) + 'px';
        
        // Rensa canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Skapa SNES RPG-liknande övergångseffekter
        if (progress < 0.5) {
            // Första halvan: Effekter ökar
            createRPGPixelEffect(ctx, canvas.width, canvas.height, progress * 2);
        } else {
            // Andra halvan: Effekter minskar
            createRPGPixelEffect(ctx, canvas.width, canvas.height, (1 - (progress - 0.5) * 2));
            
            // Uppdatera innehållet precis efter mittpunkten om det inte redan är gjort
            if (!contentUpdated) {
                contentArea.innerHTML = newContent;
                contentUpdated = true;
                
                // Återställ scroll-position
                window.scrollTo(scrollX, scrollY);
            }
        }
        
        // Rita alltid en avgränsare runt effektområdet
        drawBorder(ctx, canvas.width, canvas.height, progress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Övergången är klar, ta bort overlay
            document.body.removeChild(overlay);
            
            // Säkerställ att scroll-positionen är korrekt
            window.scrollTo(scrollX, scrollY);
        }
    }
    
    // Starta animationen
    requestAnimationFrame(animate);
}

// Funktion för att rita en stiliserad avgränsare runt effektområdet
function drawBorder(ctx, width, height, progress) {
    const borderWidth = 4; // Bredden på avgränsaren
    
    // Skapa en gradient för avgränsaren som pulserar med progress
    const pulseIntensity = 0.5 + Math.sin(progress * Math.PI * 2) * 0.3;
    
    // Övre kant
    const topGradient = ctx.createLinearGradient(0, 0, width, 0);
    topGradient.addColorStop(0, `rgba(0, 0, 0, ${pulseIntensity})`);
    topGradient.addColorStop(0.5, `rgba(80, 80, 255, ${pulseIntensity})`);
    topGradient.addColorStop(1, `rgba(0, 0, 0, ${pulseIntensity})`);
    
    // Nedre kant
    const bottomGradient = ctx.createLinearGradient(0, 0, width, 0);
    bottomGradient.addColorStop(0, `rgba(0, 0, 0, ${pulseIntensity})`);
    bottomGradient.addColorStop(0.5, `rgba(80, 80, 255, ${pulseIntensity})`);
    bottomGradient.addColorStop(1, `rgba(0, 0, 0, ${pulseIntensity})`);
    
    // Vänster kant
    const leftGradient = ctx.createLinearGradient(0, 0, 0, height);
    leftGradient.addColorStop(0, `rgba(0, 0, 0, ${pulseIntensity})`);
    leftGradient.addColorStop(0.5, `rgba(80, 80, 255, ${pulseIntensity})`);
    leftGradient.addColorStop(1, `rgba(0, 0, 0, ${pulseIntensity})`);
    
    // Höger kant
    const rightGradient = ctx.createLinearGradient(0, 0, 0, height);
    rightGradient.addColorStop(0, `rgba(0, 0, 0, ${pulseIntensity})`);
    rightGradient.addColorStop(0.5, `rgba(80, 80, 255, ${pulseIntensity})`);
    rightGradient.addColorStop(1, `rgba(0, 0, 0, ${pulseIntensity})`);
    
    // Rita kanterna
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, borderWidth);
    
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, height - borderWidth, width, borderWidth);
    
    ctx.fillStyle = leftGradient;
    ctx.fillRect(0, 0, borderWidth, height);
    
    ctx.fillStyle = rightGradient;
    ctx.fillRect(width - borderWidth, 0, borderWidth, height);
    
    // Lägg till scanlines på kanterna för en mer retro-känsla
    addBorderScanlines(ctx, width, height, borderWidth);
    
    // Lägg till hörneffekter
    //addCornerEffects(ctx, width, height, borderWidth, progress);
}

// Funktion för att lägga till scanlines på kanterna
function addBorderScanlines(ctx, width, height, borderWidth) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // Horisontella scanlines (övre och nedre kant)
    for (let x = 0; x < width; x += 4) {
        // Övre kant
        ctx.fillRect(x, 0, 2, borderWidth);
        // Nedre kant
        ctx.fillRect(x, height - borderWidth, 2, borderWidth);
    }
    
    // Vertikala scanlines (vänster och höger kant)
    for (let y = 0; y < height; y += 4) {
        // Vänster kant
        ctx.fillRect(0, y, borderWidth, 2);
        // Höger kant
        ctx.fillRect(width - borderWidth, y, borderWidth, 2);
    }
}

// Funktion för att lägga till hörneffekter
function addCornerEffects(ctx, width, height, borderWidth, progress) {
    const cornerSize = borderWidth * 3;
    const pulseSize = borderWidth * (1 + Math.sin(progress * Math.PI * 2) * 0.3);
    
    // Övre vänstra hörnet
    ctx.fillStyle = 'rgba(100, 100, 255, 0.7)';
    ctx.fillRect(0, 0, cornerSize, pulseSize);
    ctx.fillRect(0, 0, pulseSize, cornerSize);
    
    // Övre högra hörnet
    ctx.fillRect(width - cornerSize, 0, cornerSize, pulseSize);
    ctx.fillRect(width - pulseSize, 0, pulseSize, cornerSize);
    
    // Nedre vänstra hörnet
    ctx.fillRect(0, height - pulseSize, cornerSize, pulseSize);
    ctx.fillRect(0, height - cornerSize, pulseSize, cornerSize);
    
    // Nedre högra hörnet
    ctx.fillRect(width - cornerSize, height - pulseSize, cornerSize, pulseSize);
    ctx.fillRect(width - pulseSize, height - cornerSize, pulseSize, cornerSize);
}

// Funktion för att skapa pixeleringseffekt i SNES RPG-stil
function createRPGPixelEffect(ctx, width, height, intensity) {
    // Rensa canvas först
    ctx.clearRect(0, 0, width, height);
    
    // Skapa en semi-transparent bakgrund som matchar din sidas tema
    ctx.fillStyle = `rgba(0, 0, 34, ${intensity * 0.5})`;
    ctx.fillRect(0, 0, width, height);
    
    // 1. Lägg till kraftiga scanlines som varierar i intensitet
    addEnhancedScanlines(ctx, width, height, intensity);
    
    // 2. Lägg till vågeffekter som blir mer intensiva med tiden
    addEnhancedWaveEffect(ctx, width, height, intensity);
    
    // 3. Lägg till färgförskjutningseffekter (RGB split)
    addColorShiftEffect(ctx, width, height, intensity);
    
    // 4. Lägg till glitch-effekter som blir mer framträdande vid högre intensitet
    if (intensity > 0.4) {
        addEnhancedGlitchEffect(ctx, width, height, intensity);
    }
}
function addEnhancedScanlines(ctx, width, height, intensity) {
    // Beräkna scanline-täthet baserat på intensitet
    const lineSpacing = Math.max(2, Math.floor(4 * (1 - intensity * 0.5)));
    const lineHeight = Math.max(1, Math.floor(2 * intensity));
    
    // Skapa scanlines med varierande opacitet
    for (let y = 0; y < height; y += lineSpacing) {
        // Variera opaciteten för en mer dynamisk effekt
        const opacity = 0.3 + (Math.sin(y * 0.1) * 0.2 + 0.2) * intensity;
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(0, y, width, lineHeight);
    }
    
    // Lägg till några horisontella störningslinjer
    const numDistortionLines = Math.floor(intensity * 3);
    for (let i = 0; i < numDistortionLines; i++) {
        const y = Math.floor(Math.random() * height);
        const lineOpacity = 0.3 + Math.random() * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${lineOpacity})`;
        ctx.fillRect(0, y, width, 1);
    }
}

// Funktion för förbättrade vågeffekter
function addEnhancedWaveEffect(ctx, width, height, intensity) {
    // Skapa en temporär canvas för att spara originalbilden
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Kopiera nuvarande canvas till temp
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    // Rensa originalcanvas
    ctx.clearRect(0, 0, width, height);
    
    // Skapa flera vågeffekter med olika frekvenser
    const primaryAmplitude = Math.floor(intensity * 12);
    const primaryFrequency = 0.05 + intensity * 0.1;
    
    const secondaryAmplitude = Math.floor(intensity * 6);
    const secondaryFrequency = 0.02 + intensity * 0.05;
    
    // Rita med vågdistortion
    for (let y = 0; y < height; y++) {
        // Kombinera två vågor för mer komplex effekt
        const primaryOffset = Math.sin(y * primaryFrequency) * primaryAmplitude;
        const secondaryOffset = Math.cos(y * secondaryFrequency + intensity * Math.PI) * secondaryAmplitude;
        const totalOffset = primaryOffset + secondaryOffset;
        
        // Rita raden med offset
        ctx.drawImage(
            tempCanvas,
            0, y, width, 1,  // källområde
            totalOffset, y, width, 1  // målområde
        );
    }
    
    // Lägg till vertikal stretch/kompression på vissa rader om intensiteten är hög
    if (intensity > 0.7) {
        const stretchPoints = Math.floor(intensity * 5);
        for (let i = 0; i < stretchPoints; i++) {
            const centerY = Math.floor(Math.random() * height);
            const stretchHeight = Math.floor(Math.random() * 10) + 5;
            const compressionFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3
            
            // Kopiera och skala en sektion vertikalt
            const sectionHeight = Math.floor(stretchHeight / compressionFactor);
            ctx.drawImage(
                tempCanvas,
                0, centerY - sectionHeight/2, width, sectionHeight,
                0, centerY - stretchHeight/2, width, stretchHeight
            );
        }
    }
}
function addColorShiftEffect(ctx, width, height, intensity) {
    // Endast tillämpa färgförskjutning vid högre intensitet
    if (intensity < 0.3) return;
    
    // Hämta bilddata för att manipulera färgkanaler
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Skapa en temporär kopia av bilddata
    const tempData = new Uint8ClampedArray(data);
    
    // Beräkna förskjutningsvärden baserat på intensitet
    const redShift = Math.floor(intensity * 4);
    const blueShift = Math.floor(intensity * 3);
    
    // Applicera färgförskjutning
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            
            // Förskjut röd kanal åt höger
            const redIndex = (y * width + Math.min(x + redShift, width - 1)) * 4;
            data[index] = tempData[redIndex];
            
            // Förskjut blå kanal åt vänster
            const blueIndex = (y * width + Math.max(x - blueShift, 0)) * 4 + 2;
            data[index + 2] = tempData[blueIndex];
        }
    }
    
    // Uppdatera canvas med de modifierade färgerna
    ctx.putImageData(imageData, 0, 0);
    
    // Lägg till en svag blå ton över hela bilden för SNES-känsla
    ctx.fillStyle = `rgba(0, 0, 255, ${intensity * 0.05})`;
    ctx.fillRect(0, 0, width, height);
}


function addEnhancedGlitchEffect(ctx, width, height, intensity) {
    // Beräkna antal glitcheffekter baserat på intensitet
    const numGlitches = Math.floor(intensity * 5);
    
    // Spara nuvarande canvas-innehåll
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    // Skapa olika typer av glitcheffekter
    for (let i = 0; i < numGlitches; i++) {
        // Välj slumpmässigt en av flera glitch-typer
        const glitchType = Math.floor(Math.random() * 3);
        
        switch (glitchType) {
            case 0: // Horisontell linjeförskjutning
                const y = Math.floor(Math.random() * height);
                const h = Math.floor(Math.random() * 8) + 2;
                const offset = Math.floor(Math.random() * 20) - 10;
                
                // Kopiera en rad och förskjut den
                ctx.drawImage(
                    tempCanvas,
                    0, y, width, h,
                    offset, y, width, h
                );
                break;
                
            case 1: // Blockförskjutning
                const blockY = Math.floor(Math.random() * (height - 30));
                const blockHeight = Math.floor(Math.random() * 20) + 10;
                const blockOffset = Math.floor(intensity * 30) - 15;
                
                // Förskjut ett större block
                ctx.drawImage(
                    tempCanvas,
                    0, blockY, width, blockHeight,
                    blockOffset, blockY, width, blockHeight
                );
                break;
                
            case 2: // Flimmereffekt
                if (Math.random() < intensity * 0.7) {
                    const flickerY = Math.floor(Math.random() * height);
                    const flickerHeight = Math.floor(Math.random() * 4) + 1;
                    
                    // Skapa en ljus linje som simulerar flimmer
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.7})`;
                    ctx.fillRect(0, flickerY, width, flickerHeight);
                }
                break;
        }
    }
    
    // Ibland, lägg till en "bruten skärm"-effekt
    if (intensity > 0.8 && Math.random() < 0.3) {
        const breakY = Math.floor(height * 0.3 + Math.random() * height * 0.4);
        const breakHeight = Math.floor(height * 0.05);
        
        // Rita en mörk linje som simulerar en bruten skärm
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, breakY, width, breakHeight);
        
        // Förskjut innehållet under brottet
        const shiftAmount = Math.floor(Math.random() * 10) - 5;
        ctx.drawImage(
            tempCanvas,
            0, breakY + breakHeight, width, height - (breakY + breakHeight),
            shiftAmount, breakY + breakHeight, width, height - (breakY + breakHeight)
        );
    }
}