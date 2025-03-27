
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
  const video = document.querySelector('video');
  const track = document.querySelector('track');
  let cues = [];
  let currentCueIndex = 0;
  let currentVTTContent;
  let currentSRTContent = ''; 
  let originalVttStructure = null;
  const controls = [
    'linePosition',
    'alignment',
    'textSize',
    'textColor',
    'bgColor'  // Om du lade till bakgrundsfärg
];
  // Säkerställ att textningsspåret är aktiverat
  video.textTracks[0].mode = 'showing';
  
  track.addEventListener('load', () => {
      cues = Array.from(track.track.cues);
      
      // Hitta längsta tidskoden i textningen
      const maxTime = Math.max(...cues.map(cue => cue.endTime));
      
      // Sätt en egen property för att hantera längre tider
      video._customDuration = maxTime + 1;
      
      if (cues.length > 0) {
          showCue(0);
      }
  });
  
  function showCue(index) {
    currentCueIndex = index;
    const cue = cues[index];
    
    try {
        // Lägg till en liten offset för att undvika överlappning
        const timeOffset = 0.001; // 1 millisekund
        
        // Om det är första cue, använd startTime, annars lägg till offset
        const displayTime = index === 0 ? 
            cue.startTime : 
            cue.startTime + timeOffset;
            
        video.currentTime = displayTime;
        
        // Säkerställ att rätt textning visas
        const track = video.textTracks[0];
        track.mode = 'showing';
        
        // Manuellt kontrollera visning av textning
        Array.from(track.cues).forEach((c, i) => {
            if (i === index) {
                c.display = true;
            } else {
                c.display = false;
            }
        });
    } catch(e) {
        console.error('Error showing cue:', e);
    }
}

  // Ladda in original VTT-innehåll
  fetch(track.src)
  .then(response => response.text())
  .then(text => {
      originalVttStructure = parseVttStructure(text);
      currentVTTContent = text;
      currentUpdatedVTT = text;
  });

// Funktion för att uppdatera textning

function parseVttStructure(vttContent) {
    const blocks = vttContent.split('\n\n');
    const header = blocks[0];
    let styleBlock = '';
    let cueBlocks = blocks.slice(1);

    // Kolla efter style block
    const styleIndex = cueBlocks.findIndex(block => block.trim().startsWith('STYLE'));
    if (styleIndex !== -1) {
        styleBlock = cueBlocks[styleIndex];
        cueBlocks = cueBlocks.filter((_, index) => index !== styleIndex);
    }

    const cues = cueBlocks
        .filter(block => block.includes('-->'))
        .map(block => {
            const lines = block.split('\n');
            const timeCodeLine = lines[0];
            const text = lines.slice(1).join('\n');
            return {
                timecode: timeCodeLine.split(' ')[0] + ' --> ' + timeCodeLine.split(' ')[2],
                text: text
            };
        });

    return { header, styleBlock, cues };
}

// Event listeners för kontrollerna
controls.forEach(controlId => {
    const element = document.getElementById(controlId);
    if (element) {
        element.addEventListener('change', updateSubtitles);
    }
});
function getStyleValues() {
    const values = {};
    controls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            values[controlId] = element.value;
        }
    });
    return values;
}

document.getElementById('nextCue').addEventListener('click', () => {
      if (currentCueIndex < cues.length - 1) {
          showCue(currentCueIndex + 1);
      }
  });
  
  document.getElementById('prevCue').addEventListener('click', () => {
      if (currentCueIndex > 0) {
          showCue(currentCueIndex - 1);
      }
  });
  
  // Pausa videon när den laddats
  video.addEventListener('loadedmetadata', () => {
      video.pause();
      if (cues.length > 0) {
          showCue(0);
      }
  });


  function convertSrtToVtt(srtContent, linePos, alignment, size = "80%", color = "white", background = "rgba(0,0,0,0.75)") {
    // Börja med WEBVTT header
    let vttContent = 'WEBVTT\n\n';
    
    // Lägg till style block endast om färg eller bakgrund är specificerad
    if (color !== 'white' || background !== 'rgba(0,0,0,0.75)') {
        vttContent += 'STYLE\n::cue {\n';
        if (color !== 'white') {
            vttContent += `  color: ${color};\n`;
        }
        if (background !== 'rgba(0,0,0,0.75)') {
            vttContent += `  background: ${background};\n`;
        }
        vttContent += '}\n\n';
    }
    
    // Konvertera block
    const blocks = srtContent
        .trim()
        .split(/\r?\n\r?\n/)
        .filter(block => block.trim());

    blocks.forEach(block => {
        const lines = block.split(/\r?\n/);
        if (lines.length >= 2) {
            // Konvertera tidskoden men inkludera bara position och alignment
            const timecode = lines[1]
                .replace(/,/g, '.')
                .trim() + ` ${linePos} ${alignment} size:${size}`;
            
            const textLines = lines.slice(2);
            vttContent += `${timecode}\n${textLines.join('\n')}\n\n`;
        }
    });

    return vttContent;
}

function updateVttStyling(vttContent, linePos, alignment, size = "80%", color = "white", background = "rgba(0,0,0,0.75)") {
    if (!originalVttStructure) return vttContent;

    let newVtt = originalVttStructure.header + '\n\n';
    
    // Lägg till style block endast om färg eller bakgrund är specificerad
    if (color !== 'white' || background !== 'rgba(0,0,0,0.75)') {
        newVtt += 'STYLE\n::cue {\n';
        if (color !== 'white') {
            newVtt += `  color: ${color};\n`;
        }
        if (background !== 'rgba(0,0,0,0.75)') {
            newVtt += `  background: ${background};\n`;
        }
        newVtt += '}\n\n';
    }

    originalVttStructure.cues.forEach(cue => {
        // Inkludera bara position, alignment och size i tidskoden
        const timeCodeWithStyle = `${cue.timecode} ${linePos} ${alignment} size:${size}`;
        newVtt += `${timeCodeWithStyle}\n${cue.text}\n\n`;
    });

    return newVtt;
}





// Uppdatera file input hanteraren
document.getElementById('srtInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        currentFileName = file.name.replace(/\.(srt|vtt)$/i, '');
        const text = await file.text();
        let vttContent;

        if (file.name.toLowerCase().endsWith('.vtt')) {
            if (!validateVttFile(text)) {
                throw Error('Ogiltig VTT-fil: Felaktigt format');
            }
            originalVttStructure = parseVttStructure(text);
            vttContent = text;
        } else if (file.name.toLowerCase().endsWith('.srt')) {
            currentSRTContent = text;
            const styleValues = getStyleValues();
            vttContent = convertSrtToVtt(
                text,
                styleValues.linePosition,
                styleValues.alignment,
                styleValues.textSize,
                styleValues.textColor,
                styleValues.bgColor
            );
            originalVttStructure = parseVttStructure(vttContent);
        }

        currentVTTContent = vttContent;
        currentUpdatedVTT = vttContent;

        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const newTrackUrl = URL.createObjectURL(blob);
        track.src = newTrackUrl;

    } catch (error) {
        console.error('Error processing file:', error);
        alert(error.message || 'Ett fel uppstod när filen skulle läsas in');
    }
});

// Uppdatera updateSubtitles funktionen











// Uppdatera updateSubtitles funktionen
function updateSubtitles() {
    if (!originalVttStructure) {
        console.log('No VTT structure available');
        return;
    }

    const styleValues = getStyleValues();
    console.log('Style values:', styleValues);
    
    const newVTT = updateVttStyling(
        currentVTTContent,
        styleValues.linePosition,
        styleValues.alignment,
        styleValues.textSize,
        styleValues.textColor,
        styleValues.bgColor
    );

    console.log('New VTT content:', newVTT);
    
    currentUpdatedVTT = newVTT;
    currentVTTContent = newVTT;

    const blob = new Blob([newVTT], { type: 'text/vtt' });
    const newTrackUrl = URL.createObjectURL(blob);
    track.src = newTrackUrl;
}






function validateVttFile(content) {
    if (!content.trim().startsWith('WEBVTT')) {
        return false;
    }

    const blocks = content.trim().split('\n\n');
    if (blocks.length < 2) {
        return false;
    }

    // Tillåt style block i valideringen
    const timePattern = /^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/;
    let hasValidTimecode = false;

    for (const block of blocks) {
        // Skippa style block i valideringen
        if (block.trim().startsWith('STYLE')) {
            continue;
        }
        if (timePattern.test(block)) {
            hasValidTimecode = true;
            break;
        }
    }

    return hasValidTimecode;
}




// Lägg till download-funktion
document.getElementById('downloadVTT').addEventListener('click', () => {
    if (!currentUpdatedVTT) return;
    
    const blob = new Blob([currentUpdatedVTT], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    // Använd originalfilnamnet eller default
    a.download = currentFileName ? `${currentFileName}.vtt` : 'subtitles.vtt';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
});


  function previewVTT(vttContent) {
    const video = document.createElement('video');
    video.controls = true;
    video.width = 253;
    video.height = 450;
    
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = 'Svenska';
    track.srclang = 'sv';
    track.src = 'path/to/subtitles.vtt';  // Referera till en faktisk fil
    track.default = true;
    
    video.appendChild(track);
    return video;
}