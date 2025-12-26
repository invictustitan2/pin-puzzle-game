# 🧩 Pin Puzzle Game

A physics-based logic puzzle game built with TypeScript and HTML5 Canvas. Pull pins, guide resources, and avoid dangers to solve over 60 levels!

## 🚀 Features

### Core Mechanics
- **Physics Engine**: Realistic fluid simulation (water, lava) and particle interactions.
- **Interactions**: Drag to pull pins, mix fluids to create stone/steam.
- **Logic Puzzles**: Route water to the fire-fighter and keep lava away!

### Progression (New!)
- **60+ Levels**: Campaign with increasing difficulty.
- **Star Ratings**: Earn 1-3 stars based on completion time.
- **Save System**: Progress and high scores persist automatically.

### Social & Creativity
- **Level Editor**: Create your own levels with an intuitive drag-and-drop interface.
- **Level Sharing**: Export compressed level codes to share with friends.
- **Leaderboards**: Track your personal best times for every level.

## 🛠️ Tech Stack
-   **Language**: TypeScript
-   **Build Tool**: Vite
-   **Renderer**: Custom Canvas API
-   **Infrastructure**: Docker, Nginx, GitHub Actions CI

## 🎮 How to Play

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/invictustitan2/pin-puzzle-game.git
    cd pin-puzzle-game
    npm install
    ```

2.  **Run Locally**:
    ```bash
    npm run dev
    ```

3.  **Editor Mode**:
    Visit `http://localhost:5173/?editor=true` to create levels.

## 📦 Deployment

See [DEPLOY.md](./DEPLOY.md) for Docker and CI/CD instructions.

## 🤝 Contributing

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
