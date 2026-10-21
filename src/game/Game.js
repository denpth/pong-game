import { Paddle } from './Paddle.js'
import { Ball } from './Ball.js'
import { InputHandler } from './InputHandler.js'
import { ParticleSystem } from './ParticleSystem.js'
import { AudioManager } from './AudioManager.js'
import { AIPlayer } from './AIPlayer.js'

export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.isRunning = false
    this.isPaused = false
    this.gameState = 'playing' // 'playing', 'paused', 'gameOver'

    // Game mode settings
    this.gameMode = 'pvp' // 'pvp' or 'pva'
    this.aiDifficulty = 'medium'

    // Game settings
    this.targetScore = 10
    this.canvasWidth = 800
    this.canvasHeight = 400
    
    // Initialize canvas size
    this.setupCanvas()
    
    // Game objects
    this.paddle1 = new Paddle(30, this.canvasHeight / 2 - 50, 'left')
    this.paddle2 = new Paddle(this.canvasWidth - 30 - 20, this.canvasHeight / 2 - 50, 'right') // 30px from edge + 20px paddle width
    this.ball = new Ball(this.canvasWidth / 2, this.canvasHeight / 2)
    
    // Input handling
    this.inputHandler = new InputHandler()

    // AI Player (will be initialized when needed)
    this.aiPlayer = null

    // Particle system
    this.particleSystem = new ParticleSystem()

    // Audio manager
    this.audioManager = new AudioManager()

    // Score
    this.score = { player1: 0, player2: 0 }
    
    // UI elements
    this.player1ScoreEl = document.getElementById('player1-score')
    this.player2ScoreEl = document.getElementById('player2-score')
    this.gameStatusEl = document.getElementById('game-status')
    
    // Bind methods
    this.gameLoop = this.gameLoop.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleResize = this.handleResize.bind(this)

    // Event listeners
    document.addEventListener('keydown', this.handleKeyPress)
    window.addEventListener('resize', this.handleResize)
  }
  
  setupCanvas() {
    // Set the actual canvas resolution
    this.canvas.width = this.canvasWidth
    this.canvas.height = this.canvasHeight

    // Calculate responsive display size
    const maxWidth = Math.min(window.innerWidth * 0.9, 800)
    const maxHeight = Math.min(window.innerHeight * 0.6, 400)

    // Maintain aspect ratio
    const aspectRatio = this.canvasWidth / this.canvasHeight
    let displayWidth = maxWidth
    let displayHeight = displayWidth / aspectRatio

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight
      displayWidth = displayHeight * aspectRatio
    }

    // Set display size via CSS
    this.canvas.style.width = `${displayWidth}px`
    this.canvas.style.height = `${displayHeight}px`
    this.canvas.style.display = 'block'
  }
  
  start(gameMode = 'pvp', aiDifficulty = 'medium') {
    this.gameMode = gameMode
    this.aiDifficulty = aiDifficulty

    // Initialize AI if needed
    if (gameMode === 'pva') {
      this.aiPlayer = new AIPlayer(this.paddle2, aiDifficulty)
    } else {
      this.aiPlayer = null
    }

    this.isRunning = true
    this.gameState = 'playing'
    this.audioManager.resume() // Resume audio context
    this.updateUI()
    this.gameLoop()
  }
  
  pause() {
    this.isPaused = !this.isPaused
    this.gameState = this.isPaused ? 'paused' : 'playing'
    this.updateUI()
  }
  
  reset() {
    this.score = { player1: 0, player2: 0 }
    this.ball.reset(this.canvasWidth / 2, this.canvasHeight / 2)
    this.paddle1.reset(30, this.canvasHeight / 2 - 50)
    this.paddle2.reset(this.canvasWidth - 30 - 20, this.canvasHeight / 2 - 50)

    // Reset AI if present
    if (this.aiPlayer) {
      this.aiPlayer.reset()
    }

    this.gameState = 'playing'
    this.isPaused = false
    this.updateUI()
  }
  
  handleKeyPress(event) {
    if (event.code === 'Space') {
      event.preventDefault()
      this.pause()
    }

    if (event.code === 'KeyR' && this.gameState === 'gameOver') {
      event.preventDefault()
      this.reset()
    }

    if (event.code === 'Escape') {
      event.preventDefault()
      // This will be handled by MenuManager
    }
  }

  handleResize() {
    this.setupCanvas()
  }
  
  update(deltaTime) {
    if (this.isPaused || this.gameState !== 'playing') return
    
    // Update paddles based on input
    const input = this.inputHandler.getInput()
    
    // Player 1 controls (W/S or Arrow keys)
    if (input.player1Up) {
      this.paddle1.moveUp(deltaTime)
    }
    if (input.player1Down) {
      this.paddle1.moveDown(deltaTime, this.canvasHeight)
    }
    
    // Player 2 controls (only if not AI)
    if (this.gameMode === 'pvp') {
      if (input.player2Up) {
        this.paddle2.moveUp(deltaTime)
      }
      if (input.player2Down) {
        this.paddle2.moveDown(deltaTime, this.canvasHeight)
      }
    } else if (this.aiPlayer) {
      // Update AI
      this.aiPlayer.update(deltaTime, this.ball, this.canvasHeight)
    }
    
    // Update ball
    this.ball.update(deltaTime, this.canvasHeight, this.particleSystem, this.audioManager)

    // Update particle system
    this.particleSystem.update(deltaTime)

    // Check paddle collisions
    this.checkPaddleCollisions()

    // Check scoring
    this.checkScoring()
  }
  
  checkPaddleCollisions() {
    // Check collision with paddle 1
    if (this.ball.x <= this.paddle1.x + this.paddle1.width &&
        this.ball.x + this.ball.radius >= this.paddle1.x &&
        this.ball.y >= this.paddle1.y &&
        this.ball.y <= this.paddle1.y + this.paddle1.height) {
      this.ball.hitPaddle(this.paddle1, this.particleSystem, this.audioManager)
    }

    // Check collision with paddle 2
    if (this.ball.x + this.ball.radius >= this.paddle2.x &&
        this.ball.x <= this.paddle2.x + this.paddle2.width &&
        this.ball.y >= this.paddle2.y &&
        this.ball.y <= this.paddle2.y + this.paddle2.height) {
      this.ball.hitPaddle(this.paddle2, this.particleSystem, this.audioManager)
    }
  }
  
  checkScoring() {
    // Ball went off left side - Player 2 scores
    if (this.ball.x < 0) {
      this.score.player2++
      this.audioManager.playScore()
      this.resetBall()
    }

    // Ball went off right side - Player 1 scores
    if (this.ball.x > this.canvasWidth) {
      this.score.player1++
      this.audioManager.playScore()
      this.resetBall()
    }

    // Check win condition
    if (this.score.player1 >= this.targetScore || this.score.player2 >= this.targetScore) {
      this.gameState = 'gameOver'
      this.audioManager.playGameOver()
    }

    this.updateUI()
  }
  
  resetBall() {
    this.ball.reset(this.canvasWidth / 2, this.canvasHeight / 2)
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    
    // Draw center line
    this.ctx.strokeStyle = '#00ff00'
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([10, 10])
    this.ctx.beginPath()
    this.ctx.moveTo(this.canvasWidth / 2, 0)
    this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight)
    this.ctx.stroke()
    this.ctx.setLineDash([])
    
    // Draw game objects
    this.paddle1.render(this.ctx)
    this.paddle2.render(this.ctx)
    this.ball.render(this.ctx)

    // Draw particles
    this.particleSystem.render(this.ctx)
  }
  
  updateUI() {
    this.player1ScoreEl.textContent = this.score.player1
    this.player2ScoreEl.textContent = this.score.player2

    if (this.gameState === 'paused') {
      this.gameStatusEl.textContent = 'PAUSED - Press SPACE to resume'
    } else if (this.gameState === 'gameOver') {
      const winner = this.score.player1 >= this.targetScore ? 'Player 1' :
                     (this.gameMode === 'pva' ? 'AI' : 'Player 2')
      this.gameStatusEl.textContent = `${winner} Wins! Press R to restart`
    } else if (this.gameMode === 'pva' && this.aiPlayer) {
      this.gameStatusEl.textContent = `AI Difficulty: ${this.aiDifficulty.toUpperCase()}`
    } else {
      this.gameStatusEl.textContent = ''
    }
  }
  
  gameLoop(currentTime = 0) {
    if (!this.isRunning) return
    
    const deltaTime = Math.min((currentTime - (this.lastTime || currentTime)) / 1000, 0.016) // Cap at 60fps
    this.lastTime = currentTime
    
    this.update(deltaTime)
    this.render()
    
    requestAnimationFrame(this.gameLoop)
  }
  
  destroy() {
    this.isRunning = false
    document.removeEventListener('keydown', this.handleKeyPress)
    window.removeEventListener('resize', this.handleResize)

    if (this.inputHandler) {
      this.inputHandler.destroy()
    }
  }
}
