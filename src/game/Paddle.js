export class Paddle {
  constructor(x, y, side) {
    this.x = x
    this.y = y
    this.width = 20
    this.height = 100
    this.speed = 300 // pixels per second
    this.side = side // 'left' or 'right'
    
    // Store initial position for reset
    this.initialX = x
    this.initialY = y
  }
  
  moveUp(deltaTime) {
    this.y -= this.speed * deltaTime
    if (this.y < 0) {
      this.y = 0
    }
  }
  
  moveDown(deltaTime, canvasHeight) {
    this.y += this.speed * deltaTime
    if (this.y + this.height > canvasHeight) {
      this.y = canvasHeight - this.height
    }
  }
  
  reset(x, y) {
    this.x = x || this.initialX
    this.y = y || this.initialY
  }
  
  render(ctx) {
    ctx.fillStyle = '#00ff00'
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Add glow effect
    ctx.shadowColor = '#00ff00'
    ctx.shadowBlur = 10
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.shadowBlur = 0
  }
  
  // Get the center Y position of the paddle
  getCenterY() {
    return this.y + this.height / 2
  }
  
  // Get the relative hit position (-1 to 1) based on where the ball hit
  getHitPosition(ballY) {
    const paddleCenter = this.getCenterY()
    const relativePosition = (ballY - paddleCenter) / (this.height / 2)
    return Math.max(-1, Math.min(1, relativePosition))
  }
}
