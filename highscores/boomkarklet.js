<script>
function myFunction() {
    const dataAvailable = document.querySelector("button.btn.btn-plain.publication-toggle--active").length > 0;

if (document.querySelector("button.btn.btn-plain.publication-toggle--active") == null) {
console.log("StreamKey is not showing, opening and copying");
document.querySelector("button.btn.btn-plain.publication-toggle").click();
let copyText = document.querySelector("span.stream_name").textContent;
    navigator.clipboard.writeText(copyText);
    setTimeout(async()=>console.log(
        await alert("StreamKey has been copied to clipboard")), 300);
} else {
console.log("StreamKey is showing, copying");
let copyText = document.querySelector("span.stream_name").textContent;
    navigator.clipboard.writeText(copyText);
    setTimeout(async()=>console.log(
        await alert("StreamKey has been copied to clipboard")), 300);
}

if (document.querySelector("button.btn.btn-plain.publication-toggle--active") == null) {
    console.log("StreamUrl is not showing, opening and copying.");
    document.querySelector("button.btn.btn-plain.publication-toggle").click();
    let copyText = document.querySelector("span.url").textContent;
        navigator.clipboard.writeText(copyText);
        setTimeout("alert('StreamUrl has been copied to clipboard')", 300);
    } else {
    console.log("StreamUrl is showing, copying.");
    let copyText = document.querySelector("span.url").textContent;
        navigator.clipboard.writeText(copyText);
        setTimeout("alert('StreamUrl has been copied to clipboard')", 300);
    }






if (document.querySelector("button.btn.btn-plain.publication-toggle--active") == null) {
    console.log("StreamUrl is not showing, opening and copying.");
    document.querySelector("button.btn.btn-plain.publication-toggle").click();
    let copyText = document.querySelector("span.url").textContent;
        navigator.clipboard.writeText(copyText);
        setTimeout(async()=>console.log(
            await alert("StreamUrl has been copied to clipboard")), 300);
    } else {
    console.log("StreamUrl is showing, copying.");
    let copyText = document.querySelector("span.url").textContent;
        navigator.clipboard.writeText(copyText);
        setTimeout(async()=>console.log(
            await alert("StreamUrl has been copied to clipboard")), 300);
    }








    document.querySelector("button.btn.btn-plain.publication-toggle--active").click();
    document.querySelector("button.btn.btn-plain.publication-toggle").click();
  let copyText = document.querySelector("span.stream_name").textContent;
    navigator.clipboard.writeText(copyText);
  alert("Copied streamkey to clipboard: " + copyText);
}
myFunction();
</script>