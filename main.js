"use strict";

var canvas = document.getElementById("canvas");
var startBtn = document.getElementById("startBtn");
var input = document.getElementById("numInput");
var simulation = new Simulation(canvas);
var restartBtn = document.getElementById("restart");
var massCheckbox = document.getElementById("massInput");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
startBtn.addEventListener("click", () => {
  input.disabled = true;
  massCheckbox.disabled = true;
  if (!simulation.isRunning) {
    simulation.simulate(
      +input.value && +input.value < 201 ? +input.value : 5,
      massCheckbox.checked
    );
  } else {
    simulation.stopSimulation();
  }
  startBtn.innerText = simulation.isRunning ? "Stop" : "Start";
});

window.addEventListener("resize", e => {
  canvas.width = e.target.innerWidth;
  canvas.height = e.target.innerHeight;
});

restartBtn.addEventListener("click", () => {
  window.location.reload();
});
