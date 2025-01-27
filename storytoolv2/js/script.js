function qsl(s) {
  return document.querySelector(s);
}
let ctx = qsl("#canvas1").getContext("2d");
var arrowLenght = "arrowdown";
var arrowColor = "blue";
var arrow = "./png/" + arrowColor + "arrowdown.png";
var arrowLocation = 0;
var clearTimer;
var timerStarted = false;
var sliderGuider = document.getElementById("length1slider");
var sliderGuiderX = 450;
var sliderGuiderY = -2000;
var slidersGuiderY = -8000;
let canvas = document.getElementById("canvas1");
var heightOffset = 0;
var poddHeight = 717;
var selectedPodd = "png/bg2.png";
var zoomFactor = 1;
var loadingImage = false;
var currentHeigh = 1080;



// x: document.getElementById("scrollslider").value,
// y: document.getElementById("zoomedslider").value,

let isMouseDown = false;
let lastX = 0;
let lastY = 0;
const xSlider = document.getElementById('scrollslider');
const ySlider = document.getElementById('zoomedslider');
const textBlock1 = document.getElementById('textBlock1');
const textBlock2 = document.getElementById('textBlock2');
const maxChars1 = 21; // Maxlängd för första textblocket
const maxChars2 = 35; // Maxlängd för andra textblocket

function onMouseMove(event) {
    if (!isMouseDown) return;

    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;

    // Använd en skalfaktor för att bestämma hur mycket en dragrörelse ska påverka slidern
    const scaleFactor = 2;
    const changeX = deltaX * scaleFactor;
    const changeY = deltaY * scaleFactor;

    // Uppdatera X-slidern
    const newValueX = Math.min(Math.max(parseInt(xSlider.value) + changeX, xSlider.min), xSlider.max);
    xSlider.value = newValueX;

    // Uppdatera Y-slidern
    const newValueY = Math.min(Math.max(parseInt(ySlider.value) + changeY, ySlider.min), ySlider.max); // Observera "-" för Y för att invertera rörelsen
    ySlider.value = newValueY;

    lastX = event.clientX;
    lastY = event.clientY;
    generate();
}

function onMouseDown(event) {
  
    if (event.button === 0) {
        isMouseDown = true;
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

function onMouseUp(event) {
    if (event.button === 0) {
        isMouseDown = false;
    }
}

canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
textBlock1.addEventListener('input', function() {
  wrapText(this, maxChars1);
  adjustTextarea2Height();
  generate();
});

textBlock2.addEventListener('input', function() {
  wrapText(this, maxChars2);
  generate();
});

function wrapText(textarea, maxChars) {
  const lines = textarea.value.split('\n');
  const wrappedLines = lines.map(line => {
      const wrappedLine = [];
      for (let i = 0; i < line.length; i += maxChars) {
          wrappedLine.push(line.substr(i, maxChars));
      }
      return wrappedLine.join('\n');
  });
  
  textarea.value = wrappedLines.join('\n');
}

function adjustTextarea2Height() {
  const lines1 = textBlock1.value.split('\n').length;
  const minRows = 2;
  const maxRows = 6;
  const newRows = Math.max(minRows, Math.min(maxRows, lines1));
  textBlock2.rows = newRows;
}

function swapSite() {
  document.body.classList.add("fadeOutAnimation");
  setTimeout(() => {
    window.location.href = "https://bearwolf.github.io/bearwolf/chooseyourdestiny/";
  }, 900);
}
function swapSite2() {
  document.body.classList.add("fadeOutAnimation");
  setTimeout(() => {
    window.location.href = "https://bearwolf.github.io/bearwolf/chooseyourdestiny/";
  }, 900);
}
function setCtxDrawOpts(ctx, drawOpts) {
  ctx.fillStyle = drawOpts.fillStyle || ctx.fillStyle;
  ctx.strokeStyle = drawOpts.strokeStyle || ctx.strokeStyle;
  ctx.font = drawOpts.font || ctx.font;
}

function getCtxDrawOpts(ctx) {
  return {
    fillStyle: ctx.fillStyle,
    strokeStyle: ctx.strokeStyle,
    font: ctx.font,
  };
}

function slide1() {
  arrowLocation = getLengthFromTextBox1();
  sliderGuiderY = 0;
  console.log(timerStarted);
  clearTimeout(clearTimer);
  console.log("clearing");
  clearTimer = setTimeout(removeGuider, 2000);
  console.log("SLIDING");
  generate();
}

function removeGuider() {
  sliderGuiderY = -2000;
  generate();
}
function slide2() {
  document.getElementById("length_Row2").value =
    document.getElementById("length2slider").value;
  generate();
}
function slide3() {
  document.getElementById("length_Row3").value =
    document.getElementById("length3slider").value;
  generate();
}
function slide4() {
  document.getElementById("length_Row4").value =
    document.getElementById("length4slider").value;
  generate();
}
function slide5() {
  document.getElementById("length_Row5").value =
    document.getElementById("length5slider").value;
  generate();
}
function slide6() {
  document.getElementById("length_Row6").value =
    document.getElementById("length6slider").value;
  generate();
}
function number1() {
  document.getElementById("length1slider").value =
    document.getElementById("length_Row1").value;
  generate();
}
function number2() {
  document.getElementById("length2slider").value =
    document.getElementById("length_Row2").value;
  generate();
}
function number3() {
  document.getElementById("length3slider").value =
    document.getElementById("length_Row3").value;
  generate();
}
function number4() {
  document.getElementById("length4slider").value =
    document.getElementById("length_Row4").value;
  generate();
}
function number5() {
  document.getElementById("length5slider").value =
    document.getElementById("length_Row5").value;
  generate();
}
function number6() {
  document.getElementById("length6slider").value =
    document.getElementById("length_Row6").value;
  generate();
}
function drawLayers(layers, ctx) {
  let sortedByZOrderLayers = layers.sort((l1, l2) =>
    l1.zOrder < l2.zOrder ? -1 : l1.zOrder === l2.zOrder ? 0 : 1
  );
  // reset canvas, clearing all state
  ctx.canvas.width = ctx.canvas.width;
  for (layer of sortedByZOrderLayers) {
    if (layer.ready === false) {
      console.log(`skipping layer ${layer.type} (not ready)`);
      continue;
    }
    if (layerHandlers[layer.type] !== undefined) {
      layerHandlers[layer.type](layer, ctx);
    } else {
      console.error(`handler for layer type: ${layer.type} not defined`);
    }
  }
}
let layerHandlers = {
  text: function (layer, ctx) {
    canvas.style.letterSpacing = layer.letterSpacing || "0px";
    ctx.save();

    setCtxDrawOpts(ctx, layer.drawOpts || getCtxDrawOpts(ctx));
    //ctx.fontKerning = "normal";
    const lines = layer.text.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, layer.rect.x, layer.rect.y + (index * layer.lineHeight));
    });

    ctx.strokeStyle = qsl("#colorSelector1").value;
    ctx.lineWidth = 100; // thickness

    ctx.zOrder = 3;

    ctx.restore();
  },
  image: function (layer, ctx) {
    ctx.save();

    ctx.drawImage(layer.image, layer.rect.x, layer.rect.y);
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";

    ctx.restore();
  },
};
// vi vill specifikt ÅTERANVÄNDA image-handlern,
// så vi måste göra det så här

// re-use image handler for yleCDNImage
layerHandlers["yleCDNImage"] = layerHandlers["image"];

function makeLayer() {
  return {
    rect: { x: 0, y: 0, w: 0, h: 0 },
    ready: false,
    zOrder: 0,
    drawOpts: { font: "24px Heavy", fillStyle: "white" },
  };
}

function buildYleCDNImageUrl(base, imsId, extension) {
  const defaultBase =
    "https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/h_" + 1080*zoomFactor + ",c_fill/";
  const defaultImsId = getDefaultImsId();
  const defaultExtension = ".jpg";
  return `${base || defaultBase}${imsId || defaultImsId}${
    extension || defaultExtension
  }`;
}

function imsSelect(){
  loadingImage = true;
  document.getElementById("zoomSelector").selectedIndex = 0;
  zoomFactor = 1;
  generate();

}
function zoomSelect(){
  zoomFactor = document.getElementById("zoomSelector").value;
  loadingImage = true;
  if (document.getElementById("zoomSelector").selectedIndex != 0) {
    document.getElementById("zoomSpan").hidden = false;
  }
  else {
    document.getElementById("zoomSpan").hidden = true;
  }
  console.log(currentHeigh);
  generate();
}
function makeYleCDNImageLayer(options) {
  const imgUrl = buildYleCDNImageUrl(
    options.imgBaseUrl,
    options.imsId || getImsFromTextBoxOrDefault(),
    options.extension
  );

  return new Promise((resolve, reject) => {
    let imgObj = {
      ...makeLayer(),
      type: "image",
      url: imgUrl,
      image: undefined,
      ready: false,
      ...options,
    };
    imgObj.image = new Image();
    imgObj.image.crossOrigin = "anonymous";
    imgObj.image.src = imgUrl;
    imgObj.image.onload = function () {
      imgObj.ready = true;
      resolve(imgObj);

      document.getElementById("scrollslider").min = -Math.abs(
        imgObj.image.naturalWidth - 1080
      );
      document.getElementById("zoomedslider").min = -Math.abs(
        imgObj.image.naturalHeight - 1080
      );
      console.log(document.getElementById("scrollslider").min);
    };
  });
}

// naming is hard :(
function makeImageLayer(options) {
  return new Promise((resolve, reject) => {
    let imgObj = {
      ...makeLayer(),
      type: "image",
      url: options.url || "",
      image: undefined,
      ready: false,
      ...options,
    };
    imgObj.image = new Image();
    imgObj.image.crossOrigin = "anonymous";
    imgObj.image.src = options.url || "";
    imgObj.image.onload = function () {
      imgObj.ready = true;
      resolve(imgObj);
    };
  });
}

// TODO this does not need to return a promise
function makeTextLayer(options) {
  return new Promise((resolve, reject) => {
    let textObj = {
      ...makeLayer(),
      type: "text",
      text: options.text || "text missing",
      ready: true,
      ...options,
    };
    resolve(textObj);
  });
}

let layerMakers = {
  text: makeTextLayer,
  image: makeImageLayer,
  yleCDNImage: makeYleCDNImageLayer,
};

async function makeLayers(layerDescriptions) {
  console.log("creating layers, loading images etc...");
  if (loadingImage == true) {
    document.getElementById("spinner").hidden = false;
  }
  let a = [];

  for (ld of layerDescriptions) {
    if (layerMakers[ld.type] !== undefined) {
      a.push(layerMakers[ld.type](ld));
    } else {
      console.error(`no idea how to make layer of type ${ld.type}`);
    }
  }

  let layers = await Promise.all(a);

  console.log("finished making layers");
  if (document.getElementById("spinner").hidden == false){
    loadingImage = false;
    document.getElementById("spinner").hidden = true;
    setTimeout(() => {
      generate();
    }, 10);
    };
  return layers;
}

async function generate() {

  let layers = await makeLayers(getLayerDescriptions());

  drawLayers(layers, ctx);
}
function poddSelect() {
  selectedPodd = "png/" + document.getElementById("poddSelector").value;
  if (document.getElementById("poddSelector").selectedIndex != 0) {
    document.getElementById("colorSelector7").selectedIndex = 0;
    document.getElementById("colorSelector7").disabled = true;
    arrowColorPick();
  } else {
    document.getElementById("colorSelector7").disabled = false;
    releaseColours();
  }
  if (document.getElementById("poddSelector").selectedIndex == 1) {
    nyheter1minSelected();
  } else if (document.getElementById("poddSelector").selectedIndex == 2) {
    sallskapetSelected();
  } else if (document.getElementById("poddSelector").selectedIndex == 3) {
    x3mSelected();
  } else if (document.getElementById("poddSelector").selectedIndex == 4) {
    nyhetspoddenSelected();
  } else if (document.getElementById("poddSelector").selectedIndex == 5) {
    nyhetspoddenSelected();
  } else if (document.getElementById("poddSelector").selectedIndex == 8) {
    krimpoddenSelected();
  } else {
    releaseColours();
  }
  generate();
}
function releaseColours() {
  for (let i = 1; i < 7; i++) {
    for (let j = 1; j < 10; j++) {
      // enable regular colors
      document.getElementById("colorSelector" + i).options[j].disabled = false;
      // set everythang back to black
      document.getElementById("colorSelector" + i).selectedIndex = 0;
    }
    for (let k = 10; k < 13; k++) {
      // disable poddcolors
      //document.getElementById("colorSelector" + i).options[k].disabled = true;
    }
  }
}
function krimpoddenSelected() {
  releaseColours();
  for (let i = 1; i < 7; i++) {
    for (let j = 1; j < 10; j++) {
      // disable everythang else
      document.getElementById("colorSelector" + i).options[j].disabled = true;
      console.log("hej");
    }
    // Enable specific color
    document.getElementById("colorSelector" + i).options[4].disabled = false;
  }
}
function nyhetspoddenSelected() {
  releaseColours();
  for (let i = 1; i < 7; i++) {
    for (let j = 1; j < 10; j++) {
      // disable everythang else
      document.getElementById("colorSelector" + i).options[j].disabled = true;
      console.log("hej");
    }
    //enable specific color
    document.getElementById("colorSelector" + i).options[2].disabled = false;
  }
}
function sallskapetSelected() {
  releaseColours();
  for (let i = 1; i < 7; i++) {
    for (let j = 1; j < 10; j++) {
      document.getElementById("colorSelector" + i).options[j].disabled = true;
    }
  }
}
function nyheter1minSelected() {
  releaseColours();
  for (let i = 1; i < 7; i++) {
    // Enable specific color
    document.getElementById("colorSelector" + i).options[12].disabled = false;
    for (let j = 1; j < 10; j++) {
      // disable everythang else
      document.getElementById("colorSelector" + i).options[j].disabled = true;
      console.log("hej");
    }
  }
}
function x3mSelected() {
  releaseColours();
  for (let i = 1; i < 7; i++) {
    // Enable specific color
    document.getElementById("colorSelector" + i).options[10].disabled = false;
    for (let j = 1; j < 10; j++) {
      // disable everythang else
      document.getElementById("colorSelector" + i).options[j].disabled = true;
    }
  }
}

function arrowColorPick() {
  arrowColor = document.getElementById("colorSelector7").value;
  setArrow();
  var index = document.getElementById("colorSelector7").selectedIndex;
  if (index > 0 && index < 7) {
    for (let i = 1; i < 7; i++) {
      document.getElementById("colorSelector" + i).selectedIndex = 0;
      document.getElementById("colorSelector" + i).disabled = true;
    }
    console.log("All black");
  } else if (index > 6) {
    for (let i = 1; i < 7; i++) {
      document.getElementById("colorSelector" + i).selectedIndex = 11;
      document.getElementById("colorSelector" + i).disabled = true;
    }

    console.log("All white");
  } else {
    for (let i = 1; i < 7; i++) {
      document.getElementById("colorSelector" + i).selectedIndex = 0;
      document.getElementById("colorSelector" + i).disabled = false;
    }
    console.log("release the colors");
  }
  generate();
}

function masterColorCheck(x) {
  if (document.getElementById("colorSelector" + x).selectedIndex != 0) {
    for (let i = 1; i < 7; i++) {
      if (document.getElementById("colorSelector" + i).selectedIndex != 0) {
        document.getElementById("colorSelector" + i).selectedIndex =
          document.getElementById("colorSelector" + x).selectedIndex;
      }
    }
  }
  generate();
}

function setHeight() {
  heightOffset = -document.getElementById("height1slider").value;
  generate();
  console.log(heightOffset);
}

function setArrow() {
  arrow = "png/" + arrowColor + "arrowdown.png";
}

function clearErrorMessage() {
  qsl("#txt_errorMsg").innerHTML = "";
}

function setErrorMessage(msg) {
  console.error(msg);
  qsl("#txt_errorMsg").innerHTML = msg;
}

function getTextLines() {
  const lines1 = document.getElementById("textBlock1").value.split('\n').map(line => line.trim().toUpperCase());
  const lines2 = document.getElementById("textBlock2").value.split('\n').map(line => line.trim());
  return [...lines1, ...lines2];
}

function getLayerDescriptions() {
  const lines1 = document.getElementById("textBlock1").value.split('\n').map(line => line.trim().toUpperCase());
  const lines2 = document.getElementById("textBlock2").value.split('\n').map(line => line.trim());
  const lineHeight1 = 72; // Definiera lineHeight för första textblocket
  const lineHeight2 = 60;  // Definiera lineHeight för andra textblocket
  const textLayers1 = lines1.map((line, index) => ({
    type: "text",
    text: line,
    rect: { x: 69, y: 1130 + (index * lineHeight1), w: 0, h: 0 },
    drawOpts: { 
        font: "900 65px Heavy", // Font för första textblocket
        fillStyle: getColor1()
    },
    letterSpacing: "2px",
    lineHeight: lineHeight1,
    zOrder: 100 - index,
}));

const textLayers2 = lines2.map((line, index) => ({
    type: "text",
    text: line,
    rect: { x: 69, y: 1170 + (lines1.length * lineHeight1) + (index * lineHeight2), w: 0, h: 0 },
    drawOpts: { 
        font: "400 48px Regular", // Font för andra textblocket
        fillStyle: getColor1()
    },
    letterSpacing: "1.4px",
    lineHeight: lineHeight2,
    zOrder: 100 - lines1.length - index,
}));

  return [
    ...textLayers1,
    ...textLayers2,
    {
      type: "text",
      text: getTextFromTextBox1(),
      rect: { x: 45, y: 1008 + +heightOffset, w: 0, h: 0 },
      drawOpts: { font: "900 65px Heavy", fillStyle: getColor1() },
      zOrder: 100,
    },
    {
      type: "text",
      text: getTextFromTextBox2(),
      rect: { x: 45, y: 1080 + +heightOffset, w: 0, h: 0 },
      drawOpts: { font: "900 65px Heavy", fillStyle: getColor2() },
      zOrder: 1,
    },
    {
      type: "text",
      text: getTextFromTextBox3(),
      rect: { x: 45, y: 1152 + +heightOffset, w: 0, h: 0 },
      drawOpts: { font: "900 65px Heavy", fillStyle: getColor3() },
      zOrder: 1,
    },
    {
      type: "text",
      text: getTextFromTextBox4(),
      rect: { x: 45, y: 1223 + +heightOffset, w: 0, h: 0 },
      drawOpts: { font: "900 65px Heavy", fillStyle: getColor4() },
      zOrder: 1,
    },
    {
      type: "text",
      text: getTextFromTextBox5(),
      rect: { x: 45, y: 1295 + +heightOffset, w: 0, h: 0 },
      drawOpts: { font: "900 65px Heavy", fillStyle: getColor5() },
      zOrder: 1,
    },
    {
      type: "text",
      text: getTextFromTextBox6(),
      rect: { x: 45, y: 1367 + +heightOffset, w: 0, h: 0 },
      drawOpts: { font: "900 65px Heavy", fillStyle: getColor6() },
      zOrder: 1,
    },
    {
      type: "image",
      url: arrow,
      rect: { x: arrowLocation, y: 0, w: 1080, h: 1080 },
      drawOpts: {
        fillStyle: "black",
        globalCompositeOperation: "destination-in",
      },
      zOrder: -90,
    },
    {
      type: "image",
      url: selectedPodd,
      rect: { x: 0, y: +poddHeight + +heightOffset + +5, w: 1080, h: 1080 },
      drawOpts: {
        fillStyle: "black",
        globalCompositeOperation: "destination-in",
      },
      zOrder: -90,
    },

    {
      type: "image",
      url: "png/guideline.png",
      rect: {
        x: +arrowLocation + +sliderGuiderX,
        y: sliderGuiderY,
        w: 0,
        h: 0,
      },
      drawOpts: { fillStyle: "black" },
      zOrder: 3,
    },
    {
      type: "image",
      url: "png/guidelines.png",
      rect: {
        x: 0,
        y: slidersGuiderY,
        w: 0,
        h: 0,
      },
      drawOpts: { fillStyle: "black" },
      zOrder: 3,
    },
    {
      type: "image",
      url: "png/bg2.png",
      rect: { x: 0, y: 0, w: 0, h: 0 },
      drawOpts: { fillStyle: "white" },
      zOrder: -90,
    },
    {
      type: "yleCDNImage",

      rect: {
        x: document.getElementById("scrollslider").value,
        y: document.getElementById("zoomedslider").value,
        w: 0,
        h: 0,
      },
      zOrder: -100,
    },
  ];
}

function hideSnapshotFrame() {
  console.log("hideSnapshotFrame");
  const snapshotFrame = qsl("#snapshotFrame1");
  snapshotFrame.style.display = "none";
}

function copyCanvasToImage() {
  const snapshotFrame = qsl("#snapshotFrame1");
  snapshotFrame.style.display = "";
  const targetImageElement = qsl("#targetImage1");
  targetImageElement.src = ctx.canvas.toDataURL();
}

function isValidIms(ims) {
  // Todo: implement logic here to sanity check ims
  // e.g. length, contains two numbers, dash, more numbers
  return true;
}

function getDefaultImsId() {
  const DEFAULT_IMS = "39-779639603cd38bcac6a";
}

function getImsFromTextBoxOrDefault() {
  let imsNew = document.getElementById("txt_Ims").value;

  if (isValidIms(imsNew) === false) {
    imsNew = getDefaultImsId();
  }
  return imsNew;
}

function getTextFromTextBox1() {
  return document.getElementById("txt_Row1").value.toUpperCase();
}
function getTextFromTextBox2() {
  return document.getElementById("txt_Row2").value.toUpperCase();
}
function getTextFromTextBox3() {
  return document.getElementById("txt_Row3").value.toUpperCase();
}
function getTextFromTextBox4() {
  return document.getElementById("txt_Row4").value.toUpperCase();
}
function getTextFromTextBox5() {
  return document.getElementById("txt_Row5").value.toUpperCase();
}
function getTextFromTextBox6() {
  return document.getElementById("txt_Row6").value.toUpperCase();
}

function getLengthFromTextBox1() {
  return document.getElementById("length1slider").value;
}
function getLengthFromTextBox2() {
  return document.getElementById("length_Row2").value;
}
function getLengthFromTextBox3() {
  return document.getElementById("length_Row3").value;
}
function getLengthFromTextBox4() {
  return document.getElementById("length_Row4").value;
}
function getLengthFromTextBox5() {
  return document.getElementById("length_Row5").value;
}
function getLengthFromTextBox6() {
  return document.getElementById("length_Row6").value;
}
function getColor1() {
  return document.getElementById("colorSelector1").value;
}
function getColor2() {
  return document.getElementById("colorSelector2").value;
}
function getColor3() {
  return document.getElementById("colorSelector3").value;
}
function getColor4() {
  return document.getElementById("colorSelector4").value;
}
function getColor5() {
  return document.getElementById("colorSelector5").value;
}
function getColor6() {
  return document.getElementById("colorSelector6").value;
}

function setCanvasSize() {
  const DEFAULT_WIDTH = 1080;
  const DEFAULT_HEIGHT = 1920;
  let canvasWidth = Number.parseInt(qsl("#txt_canvasWidth").value);
  let canvasHeight = Number.parseInt(qsl("#txt_canvasHeight").value);
  if (isNaN(canvasWidth) || isNaN(canvasHeight)) {
    canvasWidth = DEFAULT_WIDTH;
    canvasHeight = DEFAULT_HEIGHT;
    qsl("#txt_canvasWidth").value = canvasWidth;
    qsl("#txt_canvasHeighth").value = canvasHeight;
  }

  const canvasElement = qsl("#canvas1");
  canvasElement.width = canvasWidth;
  canvasElement.height = canvasHeight;
}
function removeGuiders() {
  slidersGuiderY = -8000;

  generate();
}
function handleCheckboxClick() {
  var checkbox = document.getElementById('exampleCheckbox');
  if (checkbox.checked) {
    // Kör funktion om checkboxen är markerad
    returnGuiders();
    
  } else {
    // Kör funktion om checkboxen inte är markerad
    removeGuiders();
  }
}
function returnGuiders() {
  slidersGuiderY = 0;

  generate();
}
function hideDownload(x){
  removeGuiders();
  var checkbox = document.getElementById('exampleCheckbox');
  checkbox.checked = false;
  setTimeout(() => {
    download_img(x);
  }, 200);
  setTimeout(() => {
    //returnGuiders();
  }, 1000);
};


download_img = function (el) {
  var timeStamp = getTimeStamp();
  console.log(timeStamp);

  var canvasPNG = document.getElementById("canvas");
  var image2 = canvas.toDataURL();
  var aDownloadLink = document.createElement("a");
  aDownloadLink.download = "Storytoolv2" + "." + timeStamp + ".png";
  aDownloadLink.href = image2;
  aDownloadLink.click();
};
function getTimeStamp() {
  var date = new Date();
  return (
    date.getFullYear() +
    "." +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "." +
    date.getDate().toString().padStart(2, "0") +
    "-" +
    date.getHours().toString().padStart(2, "0") +
    "." +
    date.getMinutes().toString().padStart(2, "0")
  );
}
function showsnackbar() {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 10000);
}
// Initial justering
wrapText(textBlock1, maxChars1);
wrapText(textBlock2, maxChars2);
adjustTextarea2Height();

Promise.all([
  document.fonts.load('bold 65px Heavy'),
  document.fonts.load('normal 55px Regular')
]).then(() => {
  // Båda fonterna är laddade, nu kan du börja rita
  console.log("Fonts loaded");
  generate();
});
// autorefresh to make the loading of the font to seem snappier, don't judge me.
/* generate();
setTimeout(() => {
  generate();
}, 50);
setTimeout(() => {
  generate();
}, 250);
setTimeout(() => {
  generate();
}, 500);
setTimeout(() => {
  generate();
}, 750);
setTimeout(() => {
  generate();
}, 1500);
setTimeout(() => {
  generate();
}, 3000);
 */