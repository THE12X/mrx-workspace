import { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [inSplash, setInSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [inputValue, setInputValue] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('mrx-color-theme') || 'theme-purple');
  const [draggedId, setDraggedId] = useState(null);

  const [data, setData] = useState(() => ({
    tasks: JSON.parse(localStorage.getItem('mrx-tasks')) || [],
    rules: JSON.parse(localStorage.getItem('mrx-rules')) || [],
    facts: JSON.parse(localStorage.getItem('mrx-facts')) || [],
  }));

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('mrx-color-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(`mrx-${activeTab}`, JSON.stringify(data[activeTab]));
  }, [data, activeTab]);

  const handleAddItem = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const newItem = { id: Date.now().toString(), text, completed: false };
    setData((prev) => ({
      ...prev,
      [activeTab]: [newItem, ...prev[activeTab]],
    }));
    setInputValue('');
  };

  const toggleDone = (id) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const deleteItem = (id) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== id),
    }));
  };

  const handleDragStart = (id) => setDraggedId(id);

  const handleDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    const currentList = [...data[activeTab]];
    const fromIndex = currentList.findIndex((item) => item.id === draggedId);
    const toIndex = currentList.findIndex((item) => item.id === targetId);

    const [movedItem] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, movedItem);

    setData((prev) => ({ ...prev, [activeTab]: currentList }));
    setDraggedId(null);
  };

  const items = data[activeTab];

  return (
    <>
      {inSplash ? (
        <div id="splashScreen">
          <h1 className="splash-title">MRX</h1>
          <p className="splash-subtitle">Workspace Ecosystem</p>
          <button className="btn-enter" onClick={() => setInSplash(false)}>
            Launch System
          </button>
        </div>
      ) : (
        <div id="appContainer">
          <header>
            <div className="logo" onClick={() => setInSplash(true)} title="Return to Hero">
              <i className="ph-fill ph-hexagon"></i> MRX
            </div>

            <nav>
              {['tasks', 'rules', 'facts'].map((tab) => (
                <button
                  key={tab}
                  className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span className="nav-label-full">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <span className="nav-label-short">{tab.slice(0, 3).toUpperCase()}</span>
                </button>
              ))}
            </nav>

            <div className="theme-selector-dots">
              {[
                { name: 'theme-purple', color: '#FF0044', label: 'Crimson' },
                { name: 'theme-green', color: '#B2FF00', label: 'Green' },
                { name: 'theme-peach', color: '#FF9000', label: 'Peach' },
                { name: 'theme-cyan', color: '#00FFF1', label: 'Cyan' },
              ].map((t) => (
                <button
                  key={t.name}
                  className={`theme-dot ${theme === t.name ? 'active' : ''}`}
                  style={{ background: t.color }}
                  onClick={() => setTheme(t.name)}
                  title={t.label}
                ></button>
              ))}
            </div>
          </header>

          <main>
            <form className="input-group" onSubmit={handleAddItem}>
              <input
                type="text"
                placeholder={`Add a new ${activeTab.slice(0, -1)}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
                autoComplete="off"
              />
              <button type="submit" className="btn-add">
                <i className="ph-bold ph-plus"></i> Add
              </button>
            </form>

            <div className="list-container">
              {items.length === 0 ? (
                <div className="empty-state">
                  <i
                    className={`ph-duotone ${
                      activeTab === 'tasks'
                        ? 'ph-clipboard-text'
                        : activeTab === 'rules'
                        ? 'ph-scales'
                        : 'ph-lightbulb'
                    }`}
                  ></i>
                  <p>No {activeTab} recorded yet. Add one above!</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className="list-item"
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(item.id)}
                  >
                    <div className="item-content">
                      <div className="drag-handle" title="Drag to reorder">
                        <i className="ph-bold ph-dots-six-vertical"></i>
                      </div>
                      {(activeTab === 'rules' || activeTab === 'facts') && (
                        <div className="rule-number">{index + 1}</div>
                      )}
                      <span className={`item-text ${item.completed ? 'done' : ''}`}>{item.text}</span>
                    </div>

                    <div className="item-actions">
                      {activeTab === 'tasks' && (
                        <button
                          className={`btn-icon ${item.completed ? 'active-done' : 'done'}`}
                          onClick={() => toggleDone(item.id)}
                          title="Toggle Complete"
                        >
                          <i className="ph-bold ph-check"></i>
                        </button>
                      )}
                      <button className="btn-icon delete" onClick={() => deleteItem(item.id)} title="Delete">
                        <i className="ph-bold ph-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
}