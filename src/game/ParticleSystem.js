export class Particle {
  constructor(x, y, velocityX, velocityY, life = 1) {
    this.x = x
    this.y = y
    this.velocityX = velocityX
    this.velocityY = velocityY
    this.life = life
    this.maxLife = life
    this.size = Math.random() * 3 + 1
  }
  
  update(deltaTime) {
    this.x += this.velocityX * deltaTime
    this.y += this.velocityY * deltaTime
    this.life -= deltaTime
    
    // Fade out over time
    this.velocityX *= 0.98
    this.velocityY *= 0.98
  }
  
  render(ctx) {
    const alpha = this.life / this.maxLife
    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
  
  isDead() {
    return this.life <= 0
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = []
  }
  
  createPaddleHitEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const speed = Math.random() * 100 + 50
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed
      const life = Math.random() * 0.5 + 0.3
      
      this.particles.push(new Particle(x, y, velocityX, velocityY, life))
    }
  }
  
  createWallHitEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      const velocityX = (Math.random() - 0.5) * 100
      const velocityY = (Math.random() - 0.5) * 100
      const life = Math.random() * 0.3 + 0.2
      
      this.particles.push(new Particle(x, y, velocityX, velocityY, life))
    }
  }
  
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime)
      
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1)
      }
    }
  }
  
  render(ctx) {
    this.particles.forEach(particle => particle.render(ctx))
  }
  
  clear() {
    this.particles = []
  }
}
