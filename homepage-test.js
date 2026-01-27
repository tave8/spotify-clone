const closeBtn = document.getElementById("close-rightsidebar");
const rightSidebar = document.getElementById("right-sidebar");
const mainCenter = document.getElementById("main-center");
const openBtn = document.getElementById("open-rightsidebar");

closeBtn.addEventListener("click", () => {
  rightSidebar.classList.add("d-none");
  rightSidebar.classList.remove("d-lg-flex");

  mainCenter.classList.remove("col-lg-7");
  mainCenter.classList.add("col-lg-9");

  openBtn.classList.remove("d-none");
});

openBtn.addEventListener("click", () => {
  openBtn.classList.add("d-none");

  mainCenter.classList.remove("col-lg-9");
  mainCenter.classList.add("col-lg-7");

  rightSidebar.classList.remove("d-none");
  rightSidebar.classList.add("d-lg-flex");
});
