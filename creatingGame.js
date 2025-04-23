import { Game } from "./entities/game.js";
export const game = new Game();
let n = 6;


// Theme Toggle Functionality
 const themeToggle = document.getElementById('themeToggle');
 const gameContainer = document.querySelector('.game-container');
 
 themeToggle.addEventListener('click', () => {
   gameContainer.classList.toggle('light-theme');
 });
 
 // Player Management Functionality
 const playersContainer = document.getElementById('playersContainer');
 const addPlayerBtn = document.getElementById('addPlayerBtn');
 const startGameBtn = document.getElementById('startGameBtn');
 
 // Add Player
 addPlayerBtn.addEventListener('click', () => {
   const playerCount = playersContainer.children.length + 1;
   
   const playerInput = document.createElement('div');
   playerInput.className = 'player-input';
   
   playerInput.innerHTML = `
     <span class="player-number">${playerCount}.</span>
     <input type="text" placeholder="Player name..." class="player-name">
     <button class="remove-player">×</button>
   `;
   
   playersContainer.appendChild(playerInput);
   
   // Ensure first player can't be removed if we have more than one player
   updateRemoveButtons();
 });
 
 // Remove Player
 playersContainer.addEventListener('click', (e) => {
   if (e.target.classList.contains('remove-player')) {
     e.target.parentElement.remove();
     
     // Update player numbers
     const players = playersContainer.querySelectorAll('.player-input');
     players.forEach((player, index) => {
       player.querySelector('.player-number').textContent = `${index + 1}.`;
     });
     
     updateRemoveButtons();
   }
 });
 
 // Update Remove Buttons
 function updateRemoveButtons() {
   const players = playersContainer.querySelectorAll('.player-input');
   
   if (players.length === 1) {
     players[0].querySelector('.remove-player').style.visibility = 'hidden';
   } else {
     players.forEach(player => {
       player.querySelector('.remove-player').style.visibility = 'visible';
     });
   }
 }
 
 // Start Game Button (for demonstration)
 startGameBtn.addEventListener('click', () => {
    const playerNames = [];
    const playerInputs = document.querySelectorAll('.player-name');
   
   playerInputs.forEach(input => {
     if (input.value.trim() !== '') {
       playerNames.push(input.value.trim());
     }
   });
   
   if (playerNames.length < 6) {
     alert('You need at least 6 players to start the game!');
     return;
   }
   game.SetPlayerNames(playerNames);
   game.Start();
   game.Debug();

//    location.href = "timer.html"
 });
 
 // Initialize
 updateRemoveButtons();