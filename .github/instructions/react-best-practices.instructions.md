applyTo: "**/*.ts,**/*.tsx **/*.js,**/*.jsx,**"

# React Best Practices

## General
- Use **functional components** and **React Hooks** (`useState`, `useEffect`, `useReducer`, etc.).
- Prefer **composition over inheritance**.
- Use **TypeScript** for type safety.
- Follow the **React 19** conventions including `use server`, `use client`, and `useOptimistic`.

## State Management
- Use **local state** for UI-specific logic.
- Use **React Context** or **Zustand** for global state.
- Avoid prop drilling by using context or custom hooks.

## Performance
- Use `React.memo`, `useMemo`, and `useCallback` to avoid unnecessary re-renders.
- Use **code splitting** with `React.lazy` and `Suspense`.
- Optimize list rendering with `key` props and virtualization (e.g., `react-window`).

## File Structure
- Use a **modular folder structure**: `components/`, `pages/`, `hooks/`, `services/`, `utils/`.
- Group files by feature or domain (feature-based architecture).

## Accessibility
- Use semantic HTML and ARIA roles.
- Ensure keyboard navigation and screen reader support.

## Testing
- Use **Jest** and **React Testing Library**.
- Write unit tests for components and integration tests for flows.

## Linting & Formatting
- Use **ESLint** with `eslint-plugin-react` and **Prettier**.
