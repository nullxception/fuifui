# Development Commands

**IMPORTANT: Always use `bun` instead of node/npm/yarn/pnpm**

- `bun run app` - Start production server
- `bun run dev` - Start development server
- `bun run build` - Build for production (TypeScript check + Vite build)
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

# Code Style Guidelines

## Imports & Formatting

- Use ES6 imports/exports, group: React hooks → local imports → external libraries
- Use absolute imports from `src/` directory
- TypeScript strict mode enabled, use Prettier (2 spaces, no tabs)
- Define interfaces for all props and state, use React.FC for components

## Naming & Structure

- PascalCase for components, camelCase for functions/variables, kebab-case for CSS
- Use descriptive names (e.g., `parseDiffusionParams`, `isProcessing`)
- Define small components outside render when reused
- Follow existing Tailwind CSS patterns for styling

## State & Error Handling

- Use Zustand stores for global state, persist UI state with zustand/middleware
- Keep component state local when possible
- Use try/catch for async operations, log errors to console
- Show user-friendly error messages

## File System Notes

- Models directories contains actual \*.safetensors files in models/{checkpoints,embeddings,loras}
- \*.safetensors files are gitignored but contain real files - no need to check if they exist
