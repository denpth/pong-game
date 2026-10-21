export class MenuManager {
  constructor(onGameStart) {
    this.onGameStart = onGameStart
    this.selectedDifficulty = 'medium'
    this.gameMode = null // 'pvp' or 'pva'
    
    this.initializeElements()
    this.bindEvents()
  }
  
  initializeElements() {
    this.mainMenu = document.getElementById('main-menu')
    this.gameContainer = document.getElementById('game-container')
    this.aiDifficultySection = document.getElementById('ai-difficulty')
    
    this.pvpBtn = document.getElementById('pvp-btn')
    this.pvaBtn = document.getElementById('pva-btn')
    this.difficultyBtns = document.querySelectorAll('.difficulty-btn')
    
    this.player2Controls = document.getElementById('player2-controls')
  }
  
  bindEvents() {
    // Game mode selection
    this.pvpBtn.addEventListener('click', () => this.selectGameMode('pvp'))
    this.pvaBtn.addEventListener('click', () => this.selectGameMode('pva'))
    
    // Difficulty selection
    this.difficultyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectDifficulty(e.target.dataset.difficulty)
      })
    })
    
    // ESC key to return to menu
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.showMenu()
      }
    })
  }
  
  selectGameMode(mode) {
    this.gameMode = mode
    
    if (mode === 'pvp') {
      // Start PvP game immediately
      this.startGame()
    } else if (mode === 'pva') {
      // Show AI difficulty selection
      this.showAIDifficultySelection()
    }
  }
  
  selectDifficulty(difficulty) {
    this.selectedDifficulty = difficulty
    
    // Update button states
    this.difficultyBtns.forEach(btn => {
      btn.classList.remove('selected')
      if (btn.dataset.difficulty === difficulty) {
        btn.classList.add('selected')
      }
    })
    
    // Start AI game
    setTimeout(() => this.startGame(), 300) // Small delay for visual feedback
  }
  
  showAIDifficultySelection() {
    this.aiDifficultySection.style.display = 'block'
    
    // Set default selection
    this.difficultyBtns.forEach(btn => {
      btn.classList.remove('selected')
      if (btn.dataset.difficulty === this.selectedDifficulty) {
        btn.classList.add('selected')
      }
    })
  }
  
  hideAIDifficultySelection() {
    this.aiDifficultySection.style.display = 'none'
  }
  
  startGame() {
    this.hideMenu()
    this.updateControlsDisplay()
    
    // Call the game start callback with game mode and difficulty
    this.onGameStart(this.gameMode, this.selectedDifficulty)
  }
  
  updateControlsDisplay() {
    if (this.gameMode === 'pva') {
      this.player2Controls.textContent = 'Player 2: AI'
    } else {
      this.player2Controls.textContent = 'Player 2: I/K'
    }
  }
  
  showMenu() {
    this.mainMenu.style.display = 'block'
    this.gameContainer.style.display = 'none'
    this.hideAIDifficultySelection()
  }
  
  hideMenu() {
    this.mainMenu.style.display = 'none'
    this.gameContainer.style.display = 'flex'
  }
  
  // Get current game settings
  getGameSettings() {
    return {
      mode: this.gameMode,
      difficulty: this.selectedDifficulty
    }
  }
}
