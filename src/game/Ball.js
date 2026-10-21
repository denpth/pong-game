export class Ball {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = 10
    this.baseSpeed = 250 // base pixels per second
    this.speed = this.baseSpeed
    this.maxSpeed = 500
    this.speedIncrease = 1.05 // 5% speed increase per paddle hit
    
    // Store initial position
    this.initialX = x
    this.initialY = y
    
    // Initialize velocity
    this.resetVelocity()
  }
  
  resetVelocity() {
    // Random starting direction (left or right)
    const direction = Math.random() < 0.5 ? -1 : 1
    const angle = (Math.random() - 0.5) * Math.PI / 3 // Random angle between -30 and 30 degrees
    
    this.velocityX = Math.cos(angle) * this.speed * direction
    this.velocityY = Math.sin(angle) * this.speed
  }
  
  update(deltaTime, canvasHeight, particleSystem = null, audioManager = null) {
    // Update position
    this.x += this.velocityX * deltaTime
    this.y += this.velocityY * deltaTime

    // Bounce off top and bottom walls
    if (this.y - this.radius <= 0) {
      this.y = this.radius
      this.velocityY = -this.velocityY
      if (particleSystem) {
        particleSystem.createWallHitEffect(this.x, this.y)
      }
      if (audioManager) {
        audioManager.playWallHit()
      }
    }

    if (this.y + this.radius >= canvasHeight) {
      this.y = canvasHeight - this.radius
      this.velocityY = -this.velocityY
      if (particleSystem) {
        particleSystem.createWallHitEffect(this.x, this.y)
      }
      if (audioManager) {
        audioManager.playWallHit()
      }
    }
  }
  
  hitPaddle(paddle, particleSystem = null, audioManager = null) {
    // Get the relative hit position on the paddle (-1 to 1)
    const hitPos = paddle.getHitPosition(this.y)

    // Calculate new angle based on hit position
    const maxAngle = Math.PI / 3 // 60 degrees max
    const angle = hitPos * maxAngle

    // Determine direction based on which paddle was hit
    const direction = paddle.side === 'left' ? 1 : -1

    // Increase speed slightly
    this.speed = Math.min(this.speed * this.speedIncrease, this.maxSpeed)

    // Set new velocity
    this.velocityX = Math.cos(angle) * this.speed * direction
    this.velocityY = Math.sin(angle) * this.speed

    // Move ball away from paddle to prevent multiple collisions
    if (paddle.side === 'left') {
      this.x = paddle.x + paddle.width + this.radius
    } else {
      this.x = paddle.x - this.radius
    }

    // Create particle effect
    if (particleSystem) {
      particleSystem.createPaddleHitEffect(this.x, this.y)
    }

    // Play sound effect
    if (audioManager) {
      audioManager.playPaddleHit()
    }
  }
  
  reset(x, y) {
    this.x = x || this.initialX
    this.y = y || this.initialY
    this.speed = this.baseSpeed
    this.resetVelocity()
  }
  
  render(ctx) {
    ctx.fillStyle = '#00ff00'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Add glow effect
    ctx.shadowColor = '#00ff00'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}
