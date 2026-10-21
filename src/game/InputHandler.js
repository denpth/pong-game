export class InputHandler {
  constructor() {
    this.keys = {}
    
    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    
    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }
  
  handleKeyDown(event) {
    this.keys[event.code] = true
  }
  
  handleKeyUp(event) {
    this.keys[event.code] = false
  }
  
  getInput() {
    return {
      // Player 1 controls: W/S or Arrow Up/Down
      player1Up: this.keys['KeyW'] || this.keys['ArrowUp'],
      player1Down: this.keys['KeyS'] || this.keys['ArrowDown'],
      
      // Player 2 controls: Arrow Up/Down (when not used by Player 1) or I/K
      player2Up: this.keys['KeyI'] || (this.keys['ArrowUp'] && !this.keys['KeyW'] && !this.keys['KeyS']),
      player2Down: this.keys['KeyK'] || (this.keys['ArrowDown'] && !this.keys['KeyW'] && !this.keys['KeyS']),
      
      // Game controls
      pause: this.keys['Space'],
      restart: this.keys['KeyR']
    }
  }
  
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }
}
