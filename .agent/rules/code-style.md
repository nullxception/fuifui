# Code style

- Use Bun exclusively for all operations (package management, runtime, APIs)
- Use Bun's native APIs instead of Node.js equivalents (Bun.file, Bun.write, etc.)
- Use TypeScript with strict mode enabled
- React components use PascalCase, files use PascalCase.tsx
- Zustand stores for state management, use persist middleware for UI state
- Error handling with try/catch, console.error for logging
- Component props extend HTML attributes when appropriate
- Use forwardRef for components needing ref forwarding
- Code formatting, tailwind class name order, and imports order is handled by prettier
- Tailwind CSS for styling, follow existing variant patterns
