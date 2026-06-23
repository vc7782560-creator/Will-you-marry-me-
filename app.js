const params = new URLSearchParams(window.location.search);
const prankName = params.get("name");
if(prankName){
document.getElementById("homePage").classList.add("hidden");
document.getElementById("questionPage").classList.remove("hidden");
}
function generateLink(){
const name =
document.getElementById("friendName").value.trim();
if(!name){
alert("Please enter a friend's name.");
return;
}
const url =
window.location.origin +
window.location.pathname +
"?name=" +
encodeURIComponent(name);
document.getElementById("generatedLink").innerText = url;
document.getElementById("linkBox").style.display="block";
}
function copyLink(){
const text =
document.getElementById("generatedLink").innerText;
navigator.clipboard.writeText(text);
document.getElementById("successMsg").style.display="block";
}
function startPrank(){
document.getElementById("questionPage").classList.add("hidden");
document.getElementById("loadingPage").classList.remove("hidden");
setTimeout(()=>{
document.getElementById("loadingPage").classList.add("hidden");
document.getElementById("resultPage").classList.remove("hidden");
document.getElementById("resultText").innerHTML =
"Challl!!! Chomu " + prankName + " 😂";
},1500);
}
function goHome(){
history.pushState({},'',window.location.pathname);
document.getElementById("resultPage").classList.add("hidden");
document.getElementById("questionPage").classList.add("hidden");
document.getElementById("loadingPage").classList.add("hidden");
document.getElementById("homePage").classList.remove("hidden");
document.getElementById("friendName").value='';
document.getElementById("linkBox").style.display='none';
document.getElementById("successMsg").style.display='none';
}
