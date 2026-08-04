# Stack & Bounce - Physics Arcade Builder

A browser-based 2D arcade game built with Phaser 3, TypeScript, and Matter.js.

## Game Overview
Drop bouncing blocks to build the tallest stable tower possible. Features realistic physics, perfect placement detection, a combo system, and increasing difficulty.

## Setup & Build
This project uses Vite.

1. **Install Dependencies:**
   `npm install`

2. **Run Development Server:**
   `npm run dev`

3. **Build for Production:**
   `npm run build`

## Architecture
- `src/GameConfig.ts` - Main Phaser configuration
- `src/scenes/` - Boot, MainMenu, Game, UI, and GameOver scenes
- `src/objects/` - Block and Platform classes
- `src/systems/` - Spawner, ScoreSystem, ComboSystem, CameraEffects, ParticleManager, AudioManager
- `src/utils/` - SaveManager for Local Storage

Enjoy the game!
