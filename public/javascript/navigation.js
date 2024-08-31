let menuicon = document.getElementById("menuiocn");
let ul = document.querySelector(".ulpoint");
let closeicon = document.getElementById("closeicon");

menuicon.addEventListener('click',()=>{
    ul.classList.toggle("showData");
    console.log(ul);
});

closeicon.addEventListener('click',()=>{
    ul.classList.toggle("showData");
    console.log(ul);
});
