import React, { useState, useEffect } from 'react';
import './App.css';

const weatherApiKey = 'c7616da4b68205c2f3ae73df2c31d177';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';

function App() {
  const [todos, setTodos] = useState(() => {
    const stored = localStorage.getItem('tasks-list-project-web');
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

  const [usdToRub, setUsdToRub] = useState(null);
  
  // Сохранение задач при любом изменении
  useEffect(() => {
    console.log('Сохраняем задачи:', todos);
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
  
  const [weather, setWeather] = useState(null);
  // Погода
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric&lang=ru`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.weather && data.main) {
              setWeather({
                temp: data.main.temp,
                description: data.weather[0].description,
                city: data.name,
              });
            }
          })
          .catch((err) => console.error('Ошибка погоды:', err));
      },
      (error) => {
        console.error('Геолокация не доступна:', error);
      }
    );
  }, []);

  // Курсы валют 
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
      {(weather || usdToRub) && (
        <div className="info-block">
          {weather && (
            <div className="info-item">
              🌦 Погода в <strong>{weather.city}</strong>: {weather.temp}°C, {weather.description}
            </div>
          )}
          {usdToRub && (
            <div className="info-item">
              💵 Курс доллара: <strong>{usdToRub} ₽</strong>
            </div>
          )}
        </div>
      )}



      <h1 className="list-header">Список задач: {todos.length}</h1>
      <form onSubmit={addTask}>
        <input name="taskInput" placeholder="Введите задачу..." />
        <button>Сохранить</button>
      </form>

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
  );
}

export default App;
