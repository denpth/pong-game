export class AIPlayer {
  constructor(paddle, difficulty = 'medium') {
    this.paddle = paddle
    this.difficulty = difficulty
    
    // AI settings based on difficulty
    this.settings = this.getDifficultySettings(difficulty)
    
    // AI state
    this.targetY = paddle.y + paddle.height / 2
    this.reactionTime = 0
    this.lastBallX = 0
    this.lastBallY = 0
    this.predictedY = 0
    this.errorOffset = 0
    this.errorTimer = 0
  }
  
  getDifficultySettings(difficulty) {
    const settings = {
      easy: {
        speed: 0.6,           // 60% of paddle speed
        reactionTime: 0.3,    // 300ms reaction time
        accuracy: 0.7,        // 70% accuracy
        prediction: 0.3,      // 30% prediction ability
        errorFrequency: 2.0,  // Error every 2 seconds
        maxError: 80          // Max error in pixels
      },
      medium: {
        speed: 0.8,           // 80% of paddle speed
        reactionTime: 0.2,    // 200ms reaction time
        accuracy: 0.85,       // 85% accuracy
        prediction: 0.6,      // 60% prediction ability
        errorFrequency: 3.0,  // Error every 3 seconds
        maxError: 50          // Max error in pixels
      },
      hard: {
        speed: 0.95,          // 95% of paddle speed
        reactionTime: 0.1,    // 100ms reaction time
        accuracy: 0.95,       // 95% accuracy
        prediction: 0.9,      // 90% prediction ability
        errorFrequency: 5.0,  // Error every 5 seconds
        maxError: 20          // Max error in pixels
      },
      impossible: {
        speed: 1.0,           // 100% of paddle speed
        reactionTime: 0.05,   // 50ms reaction time
        accuracy: 0.99,       // 99% accuracy
        prediction: 1.0,      // 100% prediction ability
        errorFrequency: 10.0, // Error every 10 seconds
        maxError: 5           // Max error in pixels
      }
    }
    
    return settings[difficulty] || settings.medium
  }
  
  update(deltaTime, ball, canvasHeight) {
    // Update reaction time
    this.reactionTime -= deltaTime
    
    // Update error timer
    this.errorTimer += deltaTime
    if (this.errorTimer >= this.settings.errorFrequency) {
      this.generateError()
      this.errorTimer = 0
    }
    
    // Only react if reaction time has passed
    if (this.reactionTime <= 0) {
      this.calculateTarget(ball, canvasHeight)
      this.reactionTime = this.settings.reactionTime
    }
    
    // Move paddle towards target
    this.movePaddle(deltaTime, canvasHeight)
    
    // Store ball position for next frame
    this.lastBallX = ball.x
    this.lastBallY = ball.y
  }
  
  calculateTarget(ball, canvasHeight) {
    let targetY = ball.y
    
    // Use prediction if ball is moving towards AI paddle
    const ballMovingTowardsAI = (this.paddle.side === 'right' && ball.velocityX > 0) ||
                                (this.paddle.side === 'left' && ball.velocityX < 0)
    
    if (ballMovingTowardsAI && this.settings.prediction > Math.random()) {
      // Predict where the ball will be when it reaches the paddle
      const timeToReachPaddle = this.calculateTimeToReachPaddle(ball)
      targetY = this.predictBallPosition(ball, timeToReachPaddle, canvasHeight)
    }
    
    // Apply accuracy - add some randomness
    const accuracyError = (1 - this.settings.accuracy) * this.settings.maxError
    targetY += (Math.random() - 0.5) * accuracyError
    
    // Add current error offset
    targetY += this.errorOffset
    
    // Convert to paddle center position
    this.targetY = targetY - this.paddle.height / 2
    
    // Clamp to canvas bounds
    this.targetY = Math.max(0, Math.min(canvasHeight - this.paddle.height, this.targetY))
  }
  
  calculateTimeToReachPaddle(ball) {
    const paddleX = this.paddle.side === 'left' ? this.paddle.x + this.paddle.width : this.paddle.x
    const distanceX = Math.abs(ball.x - paddleX)
    return distanceX / Math.abs(ball.velocityX)
  }
  
  predictBallPosition(ball, time, canvasHeight) {
    let predictedY = ball.y + ball.velocityY * time
    
    // Account for wall bounces
    const ballRadius = ball.radius || 10
    while (predictedY < ballRadius || predictedY > canvasHeight - ballRadius) {
      if (predictedY < ballRadius) {
        predictedY = ballRadius + (ballRadius - predictedY)
      } else if (predictedY > canvasHeight - ballRadius) {
        predictedY = (canvasHeight - ballRadius) - (predictedY - (canvasHeight - ballRadius))
      }
    }
    
    return predictedY
  }
  
  generateError() {
    // Generate a temporary error in AI judgment
    this.errorOffset = (Math.random() - 0.5) * this.settings.maxError
    
    // Error decays over time
    setTimeout(() => {
      this.errorOffset *= 0.5
    }, this.settings.reactionTime * 1000)
  }
  
  movePaddle(deltaTime, canvasHeight) {
    const paddleCenter = this.paddle.y + this.paddle.height / 2
    const difference = this.targetY + this.paddle.height / 2 - paddleCenter
    const deadZone = 5 // Don't move if very close to target

    if (Math.abs(difference) > deadZone) {
      // Temporarily adjust paddle speed for AI
      const originalSpeed = this.paddle.speed
      this.paddle.speed = originalSpeed * this.settings.speed

      if (difference > 0) {
        // Move down
        this.paddle.moveDown(deltaTime, canvasHeight)
      } else {
        // Move up
        this.paddle.moveUp(deltaTime)
      }

      // Restore original speed
      this.paddle.speed = originalSpeed
    }
  }
  
  // Get current difficulty
  getDifficulty() {
    return this.difficulty
  }
  
  // Change difficulty
  setDifficulty(difficulty) {
    this.difficulty = difficulty
    this.settings = this.getDifficultySettings(difficulty)
  }
  
  // Reset AI state
  reset() {
    this.targetY = this.paddle.y + this.paddle.height / 2
    this.reactionTime = 0
    this.errorOffset = 0
    this.errorTimer = 0
  }
}
