var arrowLenght = "arrow3";
var arrowColor = "white";
var arrow = arrowLenght + arrowColor + ".png";
var arrowLocation = -318;
var sliderGuider = document.getElementById("length1slider");
var sliderGuiderY = -2000;
var sliderGuiderX = 450;
function qsl(s) {
  return document.querySelector(s);
}
let ctx = qsl("#canvas1").getContext("2d");

var clearTimer;
var timerStarted = false;
let canvas = document.getElementById("canvas1");
var selectedPodd = "png/sallskapet.png";
var heightOffset = 0;
var poddHeight = 516;
var zoomFactor = 1;
var loadingImage = false;
var currentHeigh = 1080;



var maskImage = new Image();
maskImage.src = 'png/mask.png'; // Sätt sökvägen till din maskbild


// x: document.getElementById("scrollslider").value,
// y: document.getElementById("zoomedslider").value,

let isMouseDown = false;
let lastX = 0;
let lastY = 0;
const xSlider = document.getElementById('scrollslider');
const ySlider = document.getElementById('zoomedslider');


// Skapa en off-screen canvas
var offScreenCanvas = document.createElement('canvas');
offScreenCanvas.width = 1080; // Sätt bredden lika med din huvudcanvas
offScreenCanvas.height = 1080; // Sätt höjden lika med din huvudcanvas
var offCtx = offScreenCanvas.getContext('2d');



function onMouseMove(event) {
    if (!isMouseDown) return;

    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;

    // Använd en skalfaktor för att bestämma hur mycket en dragrörelse ska påverka slidern
    const scaleFactor = 1;
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
function setHeight() {
  heightOffset = -document.getElementById("height1slider").value;
  generate();
  console.log(heightOffset);
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
function number1() {
  //document.getElementById('length1slider').value = document.getElementById('length_Row1').value;
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
function drawLayers(layers, ctx) {
  let sortedByZOrderLayers = layers.sort((l1, l2) =>
    l1.zOrder < l2.zOrder ? -1 : l1.zOrder === l2.zOrder ? 0 : 1
  );

  // reset canvas, clearing all state
  ctx.canvas.width = ctx.canvas.width;
  //ctx.fillStyle = '#09f';
  // set composite mode

  for (layer of sortedByZOrderLayers) {
    if (layer.ready === false) {
      console.log(`skipping layer ${layer.type} (not ready)`);
      continue;
    }
    if (layerHandlers[layer.type] !== undefined) {
      layerHandlers[layer.type](layer, offCtx);
      layerHandlers[layer.type](layer, ctx);
    } else {
      console.error(`handler for layer type: ${layer.type} not defined`);
      //console.error(layer);
    }
  }
}
let layerHandlers = {
  
  image: function (layer, ctx) {
    ctx.save();
    ctx.drawImage(layer.image, layer.rect.x, layer.rect.y);
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";

    ctx.restore();
  },
  text: function (layer, ctx) {
    ctx.save();
    setCtxDrawOpts(ctx, layer.drawOpts || getCtxDrawOpts(ctx));



      offCtx.fillStyle = 'blue';

      offCtx.drawImage(layer.image, document.getElementById("scrollslider").value - -180, document.getElementById("zoomedslider").value - -150,);
        // Rita maskbilden på off-screen canvas
        offCtx.globalCompositeOperation = 'destination-out';

        offCtx.drawImage(maskImage, 0, 0, offScreenCanvas.width, offScreenCanvas.height);

        offCtx.globalCompositeOperation = 'source-out';

        ctx.drawImage(offScreenCanvas, 0, 0); // Överför det maskerade resultatet



    ctx.restore();
  },

};




// re-use image handler for yleCDNImage
layerHandlers["yleCDNImage"] = layerHandlers["image"];

function makeLayer() {
  return {
    rect: { x: 0, y: 0, w: 0, h: 0 },
    ready: false,
    zOrder: 0,
    drawOpts: { font: "24px Yleblack", fillStyle: "white" },
  };
}

function buildYleCDNImageUrl(base, imsId, extension) {
  // const defaultBase = 'https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/w_1080/w_1080,h_1080,c_fill,g_auto/w_1080/';
  const defaultBase =
    "https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/h_" + (1080*zoomFactor).toFixed(0) + ",w_"+ (1080*zoomFactor).toFixed(0) + ",c_fill/";
  const defaultImsId = getDefaultImsId();
  const defaultExtension = ".jpg";
  return `${base || defaultBase}${imsId || defaultImsId}${
    extension || defaultExtension
  }`;
}

function buildYleCDNImageUrl2(base, imsId, extension) {
  // const defaultBase = 'https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/w_1080/w_1080,h_1080,c_fill,g_auto/w_1080/';
  const defaultBase =
    "https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/h_" + (1680*zoomFactor).toFixed(0) + ",w_"+ (1680*zoomFactor).toFixed(0) +",c_fill/";
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
    document.getElementById("zoomSpan").hidden = false;
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


      currentHeigh = imgObj.image.naturalHeight;
      console.log(currentHeigh);
      console.log(document.getElementById("scrollslider").min); // this will be 300
    };
  });
}

function makeYleCDNImageLayer2(options) {
  const imgUrl = buildYleCDNImageUrl2(
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
        imgObj.image.naturalWidth - 2640*zoomFactor
      );
      document.getElementById("zoomedslider").min = -Math.abs(
        imgObj.image.naturalHeight - 2660*zoomFactor
      );
      currentHeigh = imgObj.image.naturalHeight;
      console.log(currentHeigh);
      console.log(document.getElementById("scrollslider").min); // this will be 300
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
  text: makeYleCDNImageLayer2,
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

function masterColorCheck(x) {
  if (document.getElementById("colorSelector" + x).selectedIndex != 0) {
    for (let i = 1; i < 4; i++) {
      if (document.getElementById("colorSelector" + i).selectedIndex != 0) {
        document.getElementById("colorSelector" + i).selectedIndex =
          document.getElementById("colorSelector" + x).selectedIndex;
      }
    }
  }
  generate();
}

function poddSelect() {
  selectedPodd = "png/" + document.getElementById("poddSelector").value;

  generate();
}
function releaseColours() {
  for (let i = 1; i < 4; i++) {
    for (let j = 1; j < 10; j++) {
      // enable regular colors
      document.getElementById("colorSelector" + i).options[j].disabled = false;
      // set everythang back to black
      document.getElementById("colorSelector" + i).selectedIndex = 0;
    }
    for (let k = 10; k < 13; k++) {
      // disable poddcolors
      document.getElementById("colorSelector" + i).options[k].disabled = true;
    }
  }
}
function krimpoddenSelected() {
  releaseColours();
  for (let i = 1; i < 4; i++) {
    for (let j = 1; j < 10; j++) {
      // disable everythang else
      document.getElementById("colorSelector" + i).options[j].disabled = true;
    }
    // Enable specific color
    document.getElementById("colorSelector" + i).options[4].disabled = false;
  }
}
function nyhetspoddenSelected() {
  releaseColours();
  for (let i = 1; i < 4; i++) {
    for (let j = 1; j < 10; j++) {
      // disable everythang else
      document.getElementById("colorSelector" + i).options[j].disabled = true;
    }
    //enable specific color
    document.getElementById("colorSelector" + i).options[2].disabled = false;
  }
}
function sallskapetSelected() {
  releaseColours();
  for (let i = 1; i < 4; i++) {
    for (let j = 1; j < 10; j++) {
      document.getElementById("colorSelector" + i).options[j].disabled = true;
    }
  }
}
function nyheter1minSelected() {
  releaseColours();
  for (let i = 1; i < 4; i++) {
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
  for (let i = 1; i < 4; i++) {
    // Enable specific color
    document.getElementById("colorSelector" + i).options[10].disabled = false;
    for (let j = 1; j < 10; j++) {
      // disable everythang else
      document.getElementById("colorSelector" + i).options[j].disabled = true;
    }
  }
}

function arrowColorPick() {
  arrowColor = document.getElementById("colorSelector4").value;
  setArrow();
  var index = document.getElementById("colorSelector4").selectedIndex;
  if (index > 0 && index < 7) {
    for (let i = 1; i < 4; i++) {
      document.getElementById("colorSelector" + i).selectedIndex = 0;
      document.getElementById("colorSelector" + i).disabled = true;
    }
    console.log("All black");
  } else if (index > 6) {
    for (let i = 1; i < 4; i++) {
      document.getElementById("colorSelector" + i).selectedIndex = 10;
      document.getElementById("colorSelector" + i).disabled = true;
    }

    console.log("All white");
  } else {
    for (let i = 1; i < 4; i++) {
      document.getElementById("colorSelector" + i).selectedIndex = 0;
      document.getElementById("colorSelector" + i).disabled = false;
    }
    console.log("release the colors");
  }
  generate();
}

function setArrow() {
  arrow = "png/" + arrowLenght + arrowColor + ".png";
}
function clearErrorMessage() {
  qsl("#txt_errorMsg").innerHTML = "";
}

function setErrorMessage(msg) {
  console.error(msg);
  qsl("#txt_errorMsg").innerHTML = msg;
}

function getLayerDescriptions() {
  return [
    {
      type: "text",
      text: "hej",
      rect: { 
        x: 0,
        y: 0,
        w: 1080,
        h: 1080 },
      drawOpts: { font: "900 65px Hea§vy", fillStyle: "black" },
      zOrder: 300,
    },
    {
      type: "image",
      url: 'png/nyheteroverlay.png',
      rect: { x: 0, y: 0 , w: 1080, h: 1080 },
      drawOpts: {
        fillStyle: "black",
        globalCompositeOperation: "destination-in",
      },
      zOrder: 900,
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
      url: "png/bg2.png",
      rect: { x: 0, y: 0, w: 0, h: 0 },
      drawOpts: { fillStyle: "white" },
      zOrder: -90,
    },
    {
      type: "yleCDNImage",

      rect: {
        x: 0, //document.getElementById("scrollslider").value,
        y: 0,//document.getElementById("zoomedslider").value,
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
  // implement logic here to sanity check ims
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



function setCanvasSize() {
  const DEFAULT_WIDTH = 1080;
  const DEFAULT_HEIGHT = 1080;
  let canvasWidth = Number.parseInt(qsl("#txt_canvasWidth").value);
  let canvasHeight = Number.parseInt(qsl("#txt_canvasHeight").value);

  // bad input for some reason, reset to defaults
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

download_img = function (el) {
  var timeStamp = getTimeStamp();
  console.log(timeStamp);
  var currentPodd = getCurrentPodd();
  console.log(currentPodd);
  var canvasPNG = document.getElementById("canvas");
  var image2 = canvas.toDataURL();
  var aDownloadLink = document.createElement("a");
  aDownloadLink.download = "Nyheternatool" + "." + timeStamp +".png";
  aDownloadLink.href = image2;
  aDownloadLink.click();
};
function getCurrentPodd(){
  var poddString = document.getElementById("poddSelector").value;
  var poddStringClean = poddString
    .replace("å", "a")
    .replace("ä", "a")
    .replace("ö", "o")
    .replace("Å", "A")
    .replace("Ä", "A")
    .replace("Ö", "O");
    return poddStringClean;
}
function getTimeStamp(){
  var date = new Date();
return(
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

generate();
setTimeout(() => {
  generate();
}, 50);
setTimeout(() => {
  generate();
}, 500);
setTimeout(() => {
  generate();
}, 1500);
setTimeout(() => {
  generate();
}, 3000);

