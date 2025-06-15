import React, { useState, useEffect } from 'react';
import './App.css';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';

function App() {
  const [todos, setTodos] = useState(() => {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Ошибка чтения задач:', err);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTask = (e) => {
    e.preventDefault();
    const input = e.target.elements.taskInput;
    const value = input.value.trim();
    if (!value) return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      task: value,
      complete: false,
    };
    setTodos([...todos, newItem]);
    input.value = '';
  };

  const toggleTask = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    );
  };

  const removeTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Погода
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    fetch('https://ipwho.is/')
      .then((res) => res.json())
      .then((loc) => {
        const latitude = loc.latitude;
        const longitude = loc.longitude;
        const city = loc.city || '';
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.current_weather) {
              setWeather({
                temp: data.current_weather.temperature,
                city: city,
              });
            }
          })
          .catch((err) => console.error('Ошибка погоды:', err));
      })
      .catch((err) => console.error('Ошибка определения IP:', err));
  }, []);

  // Курсы валют
  const [usdToRub, setUsdToRub] = useState(null);
  useEffect(() => {
    fetch('https://www.cbr-xml-daily.ru/daily_json.js')
      .then((res) => res.json())
      .then((data) => {
        if (data?.Valute?.USD?.Value) {
          setUsdToRub(data.Valute.USD.Value.toFixed(2));
        }
      })
      .catch((err) => console.error('Ошибка получения курса ЦБ:', err));
  }, []);

  return (
    <div className="App">
      {weather && (
        <div className="info-item">
          🌦 Погода{weather.city ? ` в ${weather.city}` : ''}: <strong>{weather.temp}°C</strong>
        </div>
      )}

      {usdToRub && (
        <div className="info-item">
          💵 Курс доллара: <strong>{usdToRub} ₽</strong>
        </div>
      )}

      <h1 className="list-header">Список задач: {todos.length}</h1>
      <form onSubmit={addTask}>
        <input name="taskInput" placeholder="Введите задачу..." />
        <button>Сохранить</button>
      </form>

      <div className="tasks-list">
        {todos.map((todo) => (
          <div key={todo.id} className="item-todo">
            <div
              className={todo.complete ? 'item-text strike' : 'item-text'}
              onClick={() => toggleTask(todo.id)}
            >
              {todo.task}
            </div>
            <div className="item-delete" onClick={() => removeTask(todo.id)}>
              x
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
