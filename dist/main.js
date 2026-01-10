"use strict";
const title = document.getElementById("title");
const button = document.getElementById("btn");
let count = 0;
button.addEventListener("click", () => {
    count++;
    title.textContent = `Clicked ${count} times`;
});
