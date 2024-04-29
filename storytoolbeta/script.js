
function qsl(s) { return document.querySelector(s); }
let ctx = qsl('#canvas1').getContext('2d');
//let can = document.querySelector('canvas');
let canvas = document.getElementById('canvas1');
//var imsNew = document.getElementById("txt_Ims").value;

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
    
  }
  
}

// added a comment lalala 


function slide1() {
  document.getElementById('length_Row1').value = document.getElementById('length1slider').value;
  generate();
}
function slide2() {
  document.getElementById('length_Row2').value = document.getElementById('length2slider').value;
  generate();
}
function slide3() {
  document.getElementById('length_Row3').value = document.getElementById('length3slider').value;
  generate();
}
function slide4() {
  document.getElementById('length_Row4').value = document.getElementById('length4slider').value;
  generate();
}
function slide5() {
  document.getElementById('length_Row5').value = document.getElementById('length5slider').value;
  generate();
}
function slide6() {
  document.getElementById('length_Row6').value = document.getElementById('length6slider').value;
  generate();
}
function number1() {
  document.getElementById('length1slider').value = document.getElementById('length_Row1').value;
  generate();
}
function number2() {
  document.getElementById('length2slider').value = document.getElementById('length_Row2').value;
  generate();
}
function number3() {
  document.getElementById('length3slider').value = document.getElementById('length_Row3').value;
  generate();
}
function number4() {
  document.getElementById('length4slider').value = document.getElementById('length_Row4').value;
  generate();
}
function number5() {
  document.getElementById('length5slider').value = document.getElementById('length_Row5').value;
  generate();
}
function number6() {
  document.getElementById('length6slider').value = document.getElementById('length_Row6').value;
  generate();
}
function drawLayers(layers, ctx) {
   
  let sortedByZOrderLayers =
    layers.sort(
      (l1, l2) =>
        (l1.zOrder < l2.zOrder) ? -1 : (l1.zOrder === l2.zOrder) ? 0 : 1
    );
    
  // reset canvas, clearing all state
  ctx.canvas.width = ctx.canvas.width;
  for (layer of sortedByZOrderLayers) {
    if (layer.ready === false) {
      console.log(`skipping layer ${layer.type} (not ready)`)
      continue;
    }
    if (layerHandlers[layer.type] !== undefined) {
      layerHandlers[layer.type](layer, ctx);
    } else {
      console.error(`handler for layer type: ${layer.type} not defined`);
      //console.error(layer);
    }
  }
}
let layerHandlers = {
  'text': function (layer, ctx) {
  //    var checkBox = document.getElementById("myCheck");
  //if (checkBox.checked == true){
  //  canvas.style.letterSpacing = '-4px';
  //} else {
  //  canvas.style.letterSpacing = '0px';
  //}
    //canvas.style.letterSpacing = '-4px';
    canvas.style.letterSpacing = '0px';
    ctx.save();
    
    setCtxDrawOpts(ctx, layer.drawOpts || getCtxDrawOpts(ctx));
    
    // vi vill lagra den gamla, eftersom vi temporart overidar den
    //let originalletterSpacing = ctx.canvas.style.letterSpacing;
    // detta ar den nya, om den ar deklarerad
    //let newletterSpacing = layer.drawOpts.letterSpacing || ctx.canvas.style.letterSpacing;
    

   //ctx.fillRect(10, 800, 100, 100);
    //ctx.zOrder = -90
    ctx.fillText(layer.text, layer.rect.x, layer.rect.y);
    //ctx.strokeStyle = '#00b4c8';  // some color/style
    ctx.strokeStyle = qsl('#colorSelector').value;
    ctx.lineWidth = 100;         // thickness
    //ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   
    //tx.fillStyle = '#f50'
    ctx.zOrder = 3


    ctx.restore();
  },
  'image': function (layer, ctx) {
    ctx.save();
    
    // TODO - implement scaling/rotation, check if layer has
    // options for scaling/rotation
    ctx.drawImage(layer.image, layer.rect.x, layer.rect.y);
    ctx.beginPath(); 
    ctx.fillStyle = '#FFFFFF';
    //ctx.fillStyle = '#808080';
        /// get width of text
    var width1 = getLengthFromTextBox1();
    var width2 = getLengthFromTextBox2();
    var width3 = getLengthFromTextBox3();
    var width4 = getLengthFromTextBox4();
    var width5 = getLengthFromTextBox5();
    var width6 = getLengthFromTextBox6();

    /// draw background rect assuming height of font
    ctx.fillRect(0, 1190, (width1*10), 87); //72 imellan
    ctx.fillRect(0, 1262, (width2*10), 86); //70 imellan
    ctx.fillRect(0, 1332, (width3*10), 86);
    ctx.fillRect(0, 1402, (width4*10), 87);
    ctx.fillRect(0, 1472, (width5*10), 86);
    ctx.fillRect(0, 1546, (width6*10), 86);
   //ctx.fillRect(10, 900, 800, 100);
    
    ctx.restore();
  },
}
// vi vill specifikt ÅTERANVÄNDA image-handlern, 
// så vi måste göra det så här

// re-use image handler for yleCDNImage
layerHandlers['yleCDNImage'] = layerHandlers['image'];



function makeLayer() {
  
  return {
    rect: { x: 0, y: 0, w: 0, h: 0 },
    ready: false,
    zOrder: 0,
    drawOpts: { font: '24px Yleblack', fillStyle: 'white' },
  }
}

function buildYleCDNImageUrl(base, imsId, extension){
    //const defaultBase = 'https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/w_1080/w_1080,h_1920,c_fill,g_auto/w_1080/';
    const defaultBase = 'https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/h_1920,c_fill/';
    const defaultImsId = getDefaultImsId();
    const defaultExtension = '.jpg';
    return `${base||defaultBase}${imsId||defaultImsId}${extension||defaultExtension}`;
    //return `https://images.cdn.yle.fi/image/upload/f_auto,fl_progressive/q_100/h_1920,c_fill/39-10187516343b80ac986f.jpg`;
}

// NOTE : there is some reasonable way to do this
// without duplicating all of makeImageLayer, but I cannot
// come up with it right now

function makeYleCDNImageLayer(options){
    const imgUrl = buildYleCDNImageUrl(
        options.imgBaseUrl,
        options.imsId || getImsFromTextBoxOrDefault(),
        options.extension
        );
    
    return new Promise(
    (resolve, reject) => {
      let imgObj = {
        ...makeLayer(),
        type: 'image',
        url: imgUrl,
        image: undefined,
        ready: false,
        ...options,
      };
      imgObj.image = new Image();
      imgObj.image.crossOrigin = 'anonymous';
      imgObj.image.src = imgUrl;
      imgObj.image.onload = function () {
        imgObj.ready = true;
        resolve(imgObj);
        
        document.getElementById("scrollslider").min = (-Math.abs(imgObj.image.naturalWidth-1080));
        console.log(document.getElementById("scrollslider").min); // this will be 300 
      }
    });    
}


// naming is hard :(
function makeImageLayer(options) {
  return new Promise(
    (resolve, reject) => {
      let imgObj = {
        ...makeLayer(),
        type: 'image',
        url: options.url || '',
        image: undefined,
        ready: false,
        ...options,
      };
      imgObj.image = new Image();
      imgObj.image.crossOrigin = 'anonymous';
      imgObj.image.src = options.url || '';
      imgObj.image.onload = function () {
        imgObj.ready = true;
        resolve(imgObj);
        
      }
    });
}

// TODO this does not need to return a promise
function makeTextLayer(options) {
  return new Promise(
    (resolve, reject) => {
      let textObj = {
        ...makeLayer(),
        type: 'text',
        text: options.text || 'text missing',
        ready: true,
        ...options,
      }
      resolve(textObj);
    });
}

let layerMakers = {
  'text': makeTextLayer,
  'image': makeImageLayer,
  'yleCDNImage' : makeYleCDNImageLayer
}


async function makeLayers(layerDescriptions) {
  console.log('creating layers, loading images etc...');

  let a = []

  for(ld of layerDescriptions){
    if(layerMakers[ld.type] !== undefined){
      a.push( layerMakers[ld.type](ld));
    }else{
      console.error(`no idea how to make layer of type ${ld.type}`);
    }
  }

  let layers = await Promise.all(a);

  console.log('finished making layers');
  return layers;
}




// vi tar bort dethär, eftersom vi inte har textrutan här
//qsl('#txt_layers').value = JSON.stringify(defaultLayerDescriptions, undefined, 2)

async function generate() {
  let layers = await makeLayers(getLayerDescriptions());

  drawLayers(layers, ctx);
}

function clearErrorMessage(){
  qsl('#txt_errorMsg').innerHTML = '';
}

function setErrorMessage(msg) {
  console.error(msg);
  qsl('#txt_errorMsg').innerHTML = msg;
}

function getLayerDescriptions() {
 return [

  {
    type: 'text',
    text: getTextFromTextBox1(),
    rect: { x: 51, y: 1253, w: 0, h: 0 },
    drawOpts: { font: '900 65px Yleblack', fillStyle: getColor1()}, //73 imellan
    zOrder: 100,
  },
  {
    type: 'text',
    text: getTextFromTextBox2(),
    rect: { x: 51, y: 1326, w: 0, h: 0 },
    drawOpts: { font: '900 65px Yleblack', fillStyle: getColor2()}, //72 imellan
    zOrder: 1,
  },
  {
    type: 'text',
    text: getTextFromTextBox3(),
    rect: { x: 51, y: 1398, w: 0, h: 0 },
    drawOpts: { font: '900 65px Yleblack', fillStyle: getColor3()},
    zOrder: 1,
  },
   {
    type: 'text',
    text: getTextFromTextBox4(),
    rect: { x: 51, y: 1470, w: 0, h: 0 },
    drawOpts: { font: '900 65px Yleblack', fillStyle: getColor4()},
    zOrder: 1,
  },
   {
    type: 'text',
    text: getTextFromTextBox5(),
    rect: { x: 51, y: 1543, w: 0, h: 0 },
    drawOpts: { font: '900 65px Yleblack', fillStyle: getColor5()},
    zOrder: 1,
  },
   {
    type: 'text',
    text: getTextFromTextBox6(),
    rect: { x: 51, y: 1615, w: 0, h: 0 },
    drawOpts: { font: '900 65px Yleblack', fillStyle: getColor6()},
    zOrder: 1,
  },
  {
    type: 'image',
    url: 'bg2.png',
    rect: { x: 0, y: 0, w: 0, h: 0 },
    drawOpts: {fillStyle: 'white'},
    zOrder: -90
  },
  {
    type: 'yleCDNImage',
    
    rect: { x: document.getElementById('scrollslider').value, y: 0, w: 0, h: 0 },
    zOrder: -100
  }
]; 
}

function hideSnapshotFrame(){
  console.log('hideSnapshotFrame');
  const snapshotFrame = qsl('#snapshotFrame1');
  snapshotFrame.style.display = 'none'
}

function copyCanvasToImage(){
  const snapshotFrame = qsl('#snapshotFrame1');
  snapshotFrame.style.display = ''
  const targetImageElement = qsl('#targetImage1')
  targetImageElement.src = ctx.canvas.toDataURL();
}


function isValidIms(ims){
    // implement logic here to sanity check ims
    // e.g. length, contains two numbers, dash, more numbers
    return true;
}

function getDefaultImsId(){
  const DEFAULT_IMS = '39-779639603cd38bcac6a';
}

function getImsFromTextBoxOrDefault(){
  let imsNew = document.getElementById("txt_Ims").value
  
  if(isValidIms(imsNew) === false){
     imsNew = getDefaultImsId();
  }
  return imsNew;
}

// ypperligt
function getTextFromTextBox1(){
  return document.getElementById("txt_Row1").value.toUpperCase();
}  
function getTextFromTextBox2(){
  return document.getElementById("txt_Row2").value.toUpperCase();
}  
function getTextFromTextBox3(){
  return document.getElementById("txt_Row3").value.toUpperCase();
}  
function getTextFromTextBox4(){
  return document.getElementById("txt_Row4").value.toUpperCase();
}  
function getTextFromTextBox5(){
  return document.getElementById("txt_Row5").value.toUpperCase();
}  
function getTextFromTextBox6(){
  return document.getElementById("txt_Row6").value.toUpperCase();
}  
function getLengthFromTextBox1(){
  return document.getElementById("length_Row1").value;
}  
function getLengthFromTextBox2(){
  return document.getElementById("length_Row2").value;
}  
function getLengthFromTextBox3(){
  return document.getElementById("length_Row3").value;
}  
function getLengthFromTextBox4(){
  return document.getElementById("length_Row4").value;
}  
function getLengthFromTextBox5(){
  return document.getElementById("length_Row5").value;
}  
function getLengthFromTextBox6(){
  return document.getElementById("length_Row6").value;
}  
function getColor1(){
  return document.getElementById("colorSelector").value;
}  
function getColor2(){
  return document.getElementById("colorSelector2").value;
}  
function getColor3(){
  return document.getElementById("colorSelector3").value;
}  
function getColor4(){
  return document.getElementById("colorSelector4").value;
}  
function getColor5(){
  return document.getElementById("colorSelector5").value;
}  
function getColor6(){
  return document.getElementById("colorSelector6").value;
}  

function setCanvasSize(){
  const DEFAULT_WIDTH = 1080;
  const DEFAULT_HEIGHT = 1920;
  let canvasWidth = Number.parseInt(qsl('#txt_canvasWidth').value);
  let canvasHeight= Number.parseInt(qsl('#txt_canvasHeight').value);

  // bad input for some reason, reset to defaults
  if(isNaN(canvasWidth) || isNaN(canvasHeight)){
    canvasWidth = DEFAULT_WIDTH;
    canvasHeight = DEFAULT_HEIGHT;
    qsl('#txt_canvasWidth').value = canvasWidth;
    qsl('#txt_canvasHeighth').value = canvasHeight;
  }

  const canvasElement = qsl('#canvas1')
  canvasElement.width = canvasWidth;
  canvasElement.height = canvasHeight;
}

download_img = function(el) {
  var image = canvas.toDataURL("image/jpg");
  el.href = image;
};
function showsnackbar() {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 10000);
}
generate();
setTimeout(() => {  generate();; }, 1500);