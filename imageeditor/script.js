// checking activity on filters values
// calling the apply_filter method as soon as a slider is moved or set into a position
$(document).ready(function() {
  $(".range").change(apply_filter).mousemove(apply_filter);
});


// global variable
const original_image = document.getElementById('original_image_preview');


// setting canva size and return its context to drawing functions
function initializeCanva() {
  // creating the additional canva to show the filters action
  const canvas = document.getElementById('edited_image_canva');
  const ctx = canvas.getContext('2d');

  // assigning it the same size of the original image preview
  canvas.width = original_image.width;
  canvas.height = original_image.height;
  

  return ctx;
  
}

// loading and previewing the files
function previewFiles() {

  const preview = document.querySelector('img');
  const file = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();

  // the load event is fired only when a file has been read successfully, unlike loadend - because we need a success to get started
  reader.addEventListener("load", function() {
    // returning the file content
    preview.src = reader.result;

    // creating the canva to reflect the edits immediately after the original image has been loaded
    const ctx = initializeCanva();

    // drawing the original image on the canva
    ctx.drawImage(original_image, 0, 0, original_image.width, original_image.height);
    
  }, false);

  // reading the contents of the specified [image] file
  // when the read operation is successfully finished, the load event is triggered - at that time, the result attribute contains the data as a data: URL representing the file's data as a base64 encoded string
  if (file) {
    reader.readAsDataURL(file);
  }
  setTimeout(() => {  nollstall();; }, 500);

}

// called everytime a slider is hovered or moved around
// atm needed also to show the canva after the original image has been loaded
function apply_filter() {

  // getting the filter values from the sliders elements
  var grayscale_val = $("#grayscale").val();
  //console.log(grayscale_val + "%");
  var blur_val = $("#blur").val();
  var exposure_val = $("#exposure").val();
  var sepia_val = $("#sepia").val();
  var opacity_val = $("#opacity").val();
  
  var checkBox = document.getElementById("myCheck");
  if (checkBox.checked == true){
    var grayscale_val =  '100';
  } else {
    var grayscale_val =  '0';
  }

  // getting the context where to apply the changes
  const ctx = initializeCanva();

  // creating the filter from sliders values
  ctx.filter = 'grayscale(' + grayscale_val + '%) blur(' + blur_val + 'px) brightness(' + exposure_val + '%) contrast(' + sepia_val + '%) saturate(' + opacity_val + '%)';
  // console.log(ctx.filter);

  // applying the filter on the original image
  ctx.drawImage(original_image, 0, 0, original_image.width, original_image.height);
}
function nollstall() {
   document.getElementById('blur').value = 0;
   document.getElementById('exposure').value = 100;
  document.getElementById('sepia').value = 100;
  document.getElementById('opacity').value = 100;
  document.getElementById('myCheck').checked = false; 
  apply_filter();
}

// triggered by clicking on the download button
function download() {
  //console.log("asking for download");

  // keeping the same image quality
  var data = edited_image_canva.toDataURL("image/png", 1);

  // create temporary link  
  var tmpLink = document.createElement('a');
  tmpLink.download = 'edited_image.png'; // set the name of the download file 
  tmpLink.href = data;

  // temporarily add link to body and initiate the download  
  document.body.appendChild(tmpLink);
  tmpLink.click();
  document.body.removeChild(tmpLink);
}