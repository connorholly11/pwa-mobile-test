'use client';

import { TodoProvider } from './contexts/TodoContext';
import TodoList from './components/TodoList';

export default function Home() {
  return (
    <main className="main-container">
      <div className="app-container">
        <h1 className="app-title">Todo PWA</h1>
        <TodoProvider>
          <TodoList />
        </TodoProvider>
        <div className="install-prompt">
          <p>
            Want to use this app offline? Add it to your home screen!
          </p>
          <p className="install-instructions">
            (iOS: Share &gt; Add to Home Screen)
          </p>
        </div>
      </div>
    </main>
  );
}
