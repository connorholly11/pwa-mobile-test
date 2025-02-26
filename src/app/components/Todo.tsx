'use client';

import { useState } from 'react';
import { useTodo, Todo as TodoType } from '../contexts/TodoContext';

interface TodoProps {
  todo: TodoType;
}

export default function Todo({ todo }: TodoProps) {
  const { toggleTodo, deleteTodo, editTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    if (editText.trim()) {
      editTodo(todo.id, editText);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="edit-input"
          />
        ) : (
          <>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className="checkmark"></span>
            </label>
            <span 
              className={`todo-text ${todo.completed ? 'completed-text' : ''}`}
              onClick={() => setIsEditing(true)}
            >
              {todo.text}
            </span>
          </>
        )}
      </div>
      <button
        className="delete-btn"
        onClick={() => deleteTodo(todo.id)}
        aria-label="Delete todo"
      >
        ×
      </button>
    </div>
  );
} 