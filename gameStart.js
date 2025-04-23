// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const gameContainer = document.querySelector(".game-container");
const themeText = document.getElementById("themeText");

themeToggle.addEventListener("click", () => {
  gameContainer.classList.toggle("light-theme");
  if (gameContainer.classList.contains("light-theme")) {
    themeText.textContent = "DAY MODE";
  } else {
    themeText.textContent = "NIGHT MODE";
  }
});

const players = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
];
const roles = ["werewolf", "minion", "maison", "seer", "robber", "Tmaker"];
let index = 0;

const revealBtn = document.querySelector(".reveal");
const nextPlayer = document.querySelector(".nextPlayer");
const gamebutton = document.querySelector(".gameRules");
const timer = document.querySelector(".timer");
gamebutton.disabled = true;

function startCountdown(durationInMinutes, displayElement) {
  let timeLeft = durationInMinutes * 60;

  function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    displayElement.innerHTML = formattedTime;

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      displayElement.innerHTML = "Time's up!";
    } else {
      timeLeft--;
    }
  }

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  return timerInterval;
}

revealBtn.addEventListener("click", () => {
  // Remove the class to reset animation before changing text
  nextPlayer.classList.remove("animate");
  // Use a small timeout to allow the class removal to register before adding it back
  setTimeout(() => {
    if (revealBtn.innerHTML === "Click to Reveal") {
      if (index < players.length) {
        nextPlayer.innerHTML = `You are a ${roles[index]}`;
        index = index + 1;
        revealBtn.innerHTML = "Next";
      }
    } else if (revealBtn.innerHTML === "Next") {
      if (index < players.length) {
        nextPlayer.innerHTML = `Give the phone to player ${index + 1}`;
        revealBtn.innerHTML = "Click to Reveal";
      } else if (index >= players.length) {
        nextPlayer.innerHTML = "Time to play";
        revealBtn.style.display = "none";
        // Add animation for the game button appearing
        gamebutton.style.display = "block"; // Show it first
        gamebutton.classList.add("fadeIn"); // Add a class to trigger animation
        gamebutton.disabled = false;
      }
    } else if (
      revealBtn.innerHTML.includes(":") ||
      revealBtn.innerHTML === "Time's up!"
    ) {
      return false;
    }
    // Add the class after changing text to trigger animation
    nextPlayer.classList.add("animate");
  }, 10); // Small timeout
});

const Rules = [
  "Sleep",
  "Werewolf",
  "Sleep",
  "Minion",
  "WereWolf Raise Hand",
  "handsDown + Sleep",
  "Maison",
  "sleep",
  "Seer",
  "sleep",
  "Robber",
  "sleep",
  "T maker",
  "sleep",
  "everyone wake up",
];
let n = 0;
gamebutton.addEventListener("click", () => {
  nextPlayer.classList.remove("animate"); // Remove before changing text
  setTimeout(() => {
    if (n < Rules.length) {
      nextPlayer.innerHTML = Rules[n];
      n = n + 1;
    }

    if (n === Rules.length) {
      nextPlayer.innerHTML = Rules[Rules.length - 1];
      revealBtn.style.display = "none"; // Assuming revealBtn is hidden here

      // Add animation for the timer appearing
      timer.style.display = "block"; // Show it first
      timer.classList.add("fadeIn"); // Add a class to trigger animation
      startCountdown(10, timer);
      gamebutton.style.display = "none"; // Hide game button after starting timer
    }
    // Add the class after changing text
    nextPlayer.classList.add("animate");
  }, 10); // Small timeout
});
