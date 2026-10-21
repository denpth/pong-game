# Pong

A browser Pong game in plain JavaScript, built with Vite. Personal side project.

- Player vs player or player vs AI, with selectable AI difficulty
- Sound effects, particle effects and a menu system
- Code is split into small classes under `src/game/` (Ball, Paddle, AIPlayer, InputHandler, AudioManager, ParticleSystem, MenuManager, Game)

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). `npm run build` writes a static build to `dist/`.
