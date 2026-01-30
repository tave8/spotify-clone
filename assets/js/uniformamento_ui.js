/* MODIFICHE GLOBALI PER TUTTI I FILE */

// ******************** UI
const closeBtn = document.getElementById("close-rightsidebar");
const rightSidebar = document.getElementById("right-sidebar");
const mainCenter = document.getElementById("main-center");
const openBtn = document.getElementById("open-rightsidebar");

closeBtn.addEventListener("click", () => {
  rightSidebar.classList.add("d-none");
  rightSidebar.classList.remove("d-lg-flex");

  mainCenter.classList.remove("col-lg-8");
  mainCenter.classList.add("col-lg-10");

  openBtn.classList.remove("d-none");
});

openBtn.addEventListener("click", () => {
  openBtn.classList.add("d-none");

  mainCenter.classList.remove("col-lg-10");
  mainCenter.classList.add("col-lg-8");

  rightSidebar.classList.remove("d-none");
  rightSidebar.classList.add("d-lg-flex");
});
