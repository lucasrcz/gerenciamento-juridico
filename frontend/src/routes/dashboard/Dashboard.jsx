import React, { useState } from 'react';
import './TodoList.css';

const TodoList = () => {
  const [inputValue, setInputValue] = useState('');
  const MAX_CHARS = 100; 

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Tarefa 1', completed: false },
    { id: 2, text: 'Tarefa 2', completed: false },
    { id: 3, text: 'Tarefa 3', completed: true }
  ]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value.slice(0, MAX_CHARS));
  };

  const handleAddTask = () => {
    if (inputValue.trim() === '') return;

    const newTask = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="todo-container">
      <div className="todo-header">
        {/* Ícone de Prancheta Simples */}
        <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 14h6"></path>
          <path d="M9 10h6"></path>
          <path d="M9 18h6"></path>
        </svg>
        <h2>Lista de Tarefas</h2>
      </div>

      {/* Wrapper para o input e o contador */}
      <div className="input-wrapper">
        <div className="input-group">
          <input
            type="text"
            className="todo-input"
            placeholder="Adicionar nova tarefa..."
            value={inputValue}
            onChange={handleInputChange} // Usando a nova função de controle
            onKeyDown={handleKeyDown}
          />
          <button className="add-btn" onClick={handleAddTask}>
            ADICIONAR
          </button>
        </div>
      </div>

      <ul className="todo-list">
        {tasks.map((task) => (
          <li key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-content" onClick={() => toggleTask(task.id)}>
              <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                {task.completed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="task-text">{task.text}</span>
            </div>
            
            <button className="delete-btn" onClick={() => deleteTask(task.id)} aria-label="Deletar tarefa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;