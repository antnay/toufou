const title = document.getElementById("title")!;
const button = document.getElementById("btn")!;

let count: number = 0;

button.addEventListener("click", () => {
  count++;
  title.textContent = `Clicked ${count} times`;
});
