'use client';

import { useState } from 'react';
import { useTodo } from '../contexts/TodoContext';
import Todo from './Todo';

export default function TodoList() {
  const { todos, addTodo } = useTodo();
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodo(newTodoText);
      setNewTodoText('');
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="todo-list-container">
      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="What needs to be done?"
          className="new-todo-input"
        />
        <button type="submit" className="add-button">Add</button>
      </form>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="todos-container">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => <Todo key={todo.id} todo={todo} />)
        ) : (
          <div className="empty-state">
            {filter === 'all'
              ? 'No todos yet. Add one above!'
              : filter === 'active'
              ? 'No active todos!'
              : 'No completed todos!'}
          </div>
        )}
      </div>
    </div>
  );
} 