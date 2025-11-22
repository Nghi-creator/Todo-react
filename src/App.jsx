import React, { useState, useEffect, useMemo } from 'react';

// --- Custom Hooks ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function useTheme() {
  const [theme, setTheme] = useLocalStorage('theme_dark', '0');
  
  const toggleTheme = () => {
    setTheme(t => t === '1' ? '0' : '1');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === '1') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }, [theme]);

  return [theme, toggleTheme];
}

const MoonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SunIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M16.5 3.5l4 4L8 20l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg className="absolute right-2 w-4 h-4 pointer-events-none text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
  </svg>
);


// --- Main App Component ---
function App() {
  const [todos, setTodos] = useLocalStorage('todo_list_demo', [
    { id: crypto.randomUUID(), text: 'Learn React Hooks', done: false, priority: 'normal' },
    { id: crypto.randomUUID(), text: 'Do morning exercise', done: true, priority: 'low' },
  ]);
  const [theme, toggleTheme] = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [modal, setModal] = useState({ isOpen: false, mode: 'new', todo: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [toast, setToast] = useState({ isShow: false, message: '' });

  // --- Font Loading ---
  useEffect(() => {
    const fontFamilies = ['Kanit:wght@400;500', 'Inter:wght@500'];
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies.join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  // --- Computed State ---
  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      if (filter === 'active' && t.done) return false;
      if (filter === 'completed' && !t.done) return false;
      if (debouncedSearchTerm && !t.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) return false;
      return true;
    });
  }, [todos, filter, debouncedSearchTerm]);
  
  // --- CRUD Handlers ---
  const handleAddTodo = (text, priority) => {
    const newTodo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      priority
    };
    setTodos(currentTodos => [newTodo, ...currentTodos]);
    showToast('Task added!');
  };

  const handleUpdateTodo = (id, newData) => {
    setTodos(currentTodos =>
      currentTodos.map(t =>
        t.id === id ? { ...t, ...newData } : t
      )
    );
    showToast('Task updated!');
  };
  
  const handleDeleteTodo = (id) => {
    setTodos(currentTodos => currentTodos.filter(t => t.id !== id));
    handleCloseDeleteModal();
    showToast('Task deleted.');
  };

  const handleToggleDone = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      handleUpdateTodo(id, { done: !todo.done });
    }
  };

  // --- Modal Handlers ---
  const handleOpenModal = (mode, todo = null) => {
    setModal({ isOpen: true, mode, todo });
  };
  
  const handleCloseModal = () => {
    setModal({ isOpen: false, mode: 'new', todo: null });
  };
  
  const handleOpenDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id });
  };
  
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  // --- Toast Handler ---
  const showToast = (message) => {
    setToast({ isShow: true, message });
    setTimeout(() => {
      setToast({ isShow: false, message: '' });
    }, 3000);
  };
  
  return (
    <>
      {/* Main App Layout */}
      <div className="py-8 px-4 flex flex-col min-h-screen">
        <section className="w-full max-w-[800px] mx-auto flex flex-col flex-grow">
          <div className="font-kanit flex flex-col flex-grow">
            {/* Header */}
            <header className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-[28px] font-medium">TO-DO LIST</h1>
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-md border border-primary" 
                  title="Toggle light/dark"
                >
                  {theme === '1' ? <SunIcon /> : <MoonIcon />}
                </button>
              </div>

              <div className="flex gap-4">
                {/* Search */}
                <div className="flex-grow flex items-center border border-primary rounded-md px-3 py-2">
                  <input 
                    type="text" 
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none font-inter text-base placeholder-gray-400" 
                  />
                  <button 
                    onClick={() => handleOpenModal('new')}
                    className="ml-3 px-3 py-1 bg-primary text-white rounded-md hidden sm:block"
                  >
                    Add
                  </button>
                </div>

                {/* Filter */}
                <div className="relative flex items-center gap-2">
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none border border-primary rounded-md px-3 py-2 pr-8"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>
            </header>

            {/* Scrollable Todos */}
            <main id="todo-list" className="divide-y divide-[var(--muted)] flex-grow rounded-lg bg-transparent backdrop-blur-sm p-2">
              {filteredTodos.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center gap-3">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076503.png"
                    alt="No tasks found"
                    className="w-[180px] opacity-70"
                  />
                  <p className="text-sm text-[var(--muted)]">No tasks found</p>
                </div>
              ) : (
                filteredTodos.map(todo => (
                  <TodoItem 
                    key={todo.id} 
                    todo={todo}
                    onToggleDone={handleToggleDone}
                    onEdit={handleOpenModal}
                    onDelete={handleOpenDeleteModal}
                  />
                ))
              )}
            </main>
          </div>

          {/* Floating Add Button (mobile) */}
          <button 
            onClick={() => handleOpenModal('new')}
            className="fixed bottom-6 right-6 bg-primary w-[56px] h-[56px] rounded-full shadow-lg flex items-center justify-center text-white sm:hidden"
          >
            <PlusIcon />
          </button>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-6 text-[var(--muted)] text-sm font-inter mt-auto"> 
          © 2025 Codeshift. All rights reserved. 
        </footer>
      </div>

      {/* Toast */}
      <div id="toast" className={toast.isShow ? 'show' : ''}>
        {toast.message}
      </div>

      {/* Modals */}
      <AddEditModal 
        modal={modal}
        onClose={handleCloseModal}
        onAdd={handleAddTodo}
        onUpdate={handleUpdateTodo}
      />
      <DeleteModal 
        modal={deleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteTodo}
      />
    </>
  );
}

function TodoItem({ todo, onToggleDone, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-4 py-4 px-2 transition hover:bg-[var(--input-bg)]/40 rounded-lg">
      <button 
        onClick={() => onToggleDone(todo.id)}
        className={`w-[26px] h-[26px] rounded-sm flex-shrink-0 border border-primary flex items-center justify-center ${todo.done ? 'bg-primary' : ''}`}
        style={{ background: todo.done ? 'var(--primary)' : 'transparent' }}
      >
        {todo.done && <CheckIcon />}
      </button>

      <div className="flex-grow">
        <p 
          className="font-medium text-lg"
          style={{ 
            textDecoration: todo.done ? 'line-through' : 'none',
            opacity: todo.done ? 0.6 : 1
          }}
        >
          {todo.text}
        </p>
        <span className="text-sm text-[var(--muted)]">
          {todo.priority === 'high' ? 'High priority' :
           todo.priority === 'low' ? 'Low priority' : 'Normal priority'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => onEdit('edit', todo)}>
          <EditIcon />
        </button>
        <button onClick={() => onDelete(todo.id)}>
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}

function AddEditModal({ modal, onClose, onAdd, onUpdate }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    if (modal.isOpen && modal.mode === 'edit' && modal.todo) {
      setText(modal.todo.text);
      setPriority(modal.todo.priority);
    } else {
      setText('');
      setPriority('normal');
    }
  }, [modal]);

  const handleSubmit = () => {
    if (!text.trim()) return; 
    if (modal.mode === 'edit') {
      onUpdate(modal.todo.id, { text, priority });
    } else {
      onAdd(text, priority);
    }
    onClose();
  };
  
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="rounded-xl w-full max-w-[420px] p-6 flex flex-col"
        style={{ background: 'var(--modal-bg)', color: 'var(--text)' }}
      >
        <h2 className="text-2xl font-medium mb-4">
          {modal.mode === 'edit' ? 'Edit Task' : 'New Task'}
        </h2>

        <div className="space-y-4 mb-6">
          <div className="border border-primary rounded-md px-3 py-2">
            <input 
              type="text" 
              placeholder="Enter task..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent outline-none font-inter text-base" 
            />
          </div>
          <div className="flex gap-3 items-center">
            <label className="text-sm">Priority:</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border border-primary rounded-md px-3 py-2"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-primary rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ modal, onClose, onConfirm }) {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--modal-bg)] text-[var(--text)] rounded-lg p-6 w-full max-w-[360px] text-center shadow-lg">
        <h3 className="text-xl font-medium mb-4">Delete this task?</h3>
        <p className="text-[var(--muted)] mb-6">This action cannot be undone.</p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="px-4 py-2 border border-primary rounded-md">Cancel</button>
          <button onClick={() => onConfirm(modal.id)} className="px-4 py-2 bg-primary text-white rounded-md">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default App;