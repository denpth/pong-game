import './style.css'
import { Game } from './game/Game.js'
import { MenuManager } from './game/MenuManager.js'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas')

  // Create game instance once
  const game = new Game(canvas)

  // Initialize menu manager
  const menuManager = new MenuManager((gameMode, aiDifficulty) => {
    // Reset and start the existing game instance
    game.reset()
    game.start(gameMode, aiDifficulty)
  })

  // Show menu initially
  menuManager.showMenu()
})
