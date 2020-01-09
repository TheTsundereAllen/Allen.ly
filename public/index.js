document.getElementById("generateBtn").addEventListener("click",function(){
  document.getElementById("modal").style.display="inline-block";
  document.getElementById("blackmodal").style.display="block";
})
document.getElementById("deletebutton").addEventListener("click",function(){
  document.getElementById("modal").style.display="none";
  document.getElementById("blackmodal").style.display="none";
})

document.getElementById("copylinkbtn").addEventListener("click",function(){
  let copyText = document.getElementById("textarea");
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand("copy");
  alert("Copied the text: " + copyText.value);
})

let x=document.getElementsByTagName("p");
console.log(x.length)
for(let i=0;i<x.length;i++){
  if(x[i].length>30){
    x[i]=x.substring(0,26)+"...";
    console.log(x[i]);
  }
}