export class AudioManager {
  constructor() {
    this.audioContext = null
    this.enabled = true
    
    // Initialize audio context on first user interaction
    this.initAudioContext()
  }
  
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported')
      this.enabled = false
    }
  }
  
  // Create a simple beep sound
  createBeep(frequency = 440, duration = 0.1, volume = 0.1) {
    if (!this.enabled || !this.audioContext) return
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (e) {
      console.warn('Error playing sound:', e)
    }
  }
  
  // Sound effects
  playPaddleHit() {
    this.createBeep(800, 0.1, 0.1)
  }
  
  playWallHit() {
    this.createBeep(400, 0.1, 0.1)
  }
  
  playScore() {
    // Play a sequence of beeps for scoring
    this.createBeep(600, 0.2, 0.15)
    setTimeout(() => this.createBeep(800, 0.2, 0.15), 100)
    setTimeout(() => this.createBeep(1000, 0.3, 0.15), 200)
  }
  
  playGameOver() {
    // Play a descending sequence for game over
    this.createBeep(800, 0.3, 0.2)
    setTimeout(() => this.createBeep(600, 0.3, 0.2), 150)
    setTimeout(() => this.createBeep(400, 0.5, 0.2), 300)
  }
  
  // Resume audio context (needed for some browsers)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }
}
