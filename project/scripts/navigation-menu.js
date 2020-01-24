const tog = document.querySelector(".navigation-tog");
const nav =  document.querySelector(".navigation-list");

nav.classList.remove('navigation-list--nojs');

tog.addEventListener("click", function(event) {
  event.preventDefault();
  nav.classList.toggle("navigation-list--show");
  tog.classList.toggle("navigation-tog--close");
});

window.addEventListener("keydown", function(event) {
  if (event.keyCode === 27) {
    nav.classList.remove("navigation-list--show");
    tog.classList.remove("navigation-tog--close");
  }
});