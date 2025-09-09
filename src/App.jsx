import React, { useState, useContext, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, User, LogOut, Home, BarChart3, Eye, Edit, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './app.css';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    await checkAuthStatus();
    return response;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// API Services
const expenseService = {
  getAll: () => api.get('/expense/all'),
  getById: (id) => api.get(`/expense/${id}`),
  create: (data) => api.post('/expense', data),
  update: (id, data) => api.put(`/expense/${id}`, data),
  delete: (id) => api.delete(`/expense/${id}`)
};

const incomeService = {
  getAll: () => api.get('/income/all'),
  getById: (id) => api.get(`/income/${id}`),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`)
};

const statsService = {
  getStats: () => api.get('/stats'),
  getChartData: () => api.get('/stats/chart')
};

// Components
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
    { path: '/income', icon: TrendingUp, label: 'Income' },
    { path: '/stats', icon: BarChart3, label: 'Statistics' }
  ];

  return (
    <div className="app-container">
      <nav className="sidebar card">
        <h2 className="h2">Personal Finance Tracker</h2>
        <div className="navbar-container">
          <ul className="navbar">
            {navItems.map(({ path, icon: Icon, label }) => (
              <li key={path} className="nav-item">
                <Icon className="icon" />
                <Link to={path}>{label}</Link>
              </li>
            ))}
          </ul>
          <button type="button" onClick={handleLogout} className="button">
            <LogOut className="icon" /> Logout
        </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="form-container card">
        <div className="form-header">
          <DollarSign className="icon" />
          <h2>Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error">{error}</div>}

          <div className="form-fields">
            <input
              type="text"
              required
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              placeholder="Username"
            />
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="Password"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="form-footer">
            <Link to="/register">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(formData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="form-container card">
        <div className="form-header">
          <DollarSign className="icon" />
          <h2>Create your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error">{error}</div>}

          <div className="form-fields">
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="First Name"
            />
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Last Name"
            />
          </div>

          <div className="form-fields">
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Username"
            />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email"
            />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Password"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <div className="form-footer">
            <Link to="/login">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="card">
          <div className="icon"><TrendingUp /></div>
          <dl>
            <dt>Total Income</dt>
            <dd>${stats?.income?.toFixed(2) || '0.00'}</dd>
          </dl>
        </div>

        <div className="card">
          <div className="icon"><TrendingDown /></div>
          <dl>
            <dt>Total Expenses</dt>
            <dd>${stats?.expense?.toFixed(2) || '0.00'}</dd>
          </dl>
        </div>

        <div className="card">
          <div className="icon"><DollarSign /></div>
          <dl>
            <dt>Balance</dt>
            <dd>${stats?.balance?.toFixed(2) || '0.00'}</dd>
          </dl>
        </div>
      </div>

      {stats?.latestIncome && (
        <div className="card">
          <h2>Latest Income</h2>
          <ul>
            <li>
              <div>
                <p> <span className="label">Title:</span> {stats.latestIncome.title}</p>
                <p> <span className="label">Category:</span> {stats.latestIncome.category}</p>
                <p> <span className="label">Amount:</span> ${stats.latestIncome.amount}</p>
                <p> <span className="label">Date:</span> {stats.latestIncome.date}</p>
              </div>
            </li>
          </ul>
        </div>
      )}

      {stats?.latestExpense && (
        <div className="card">
          <h2>Latest Expense</h2>
          <ul>
            <li>
              <div>
                <p> <span className="label">Title:</span> {stats.latestExpense.title}</p>
                <p> <span className="label">Category:</span> {stats.latestExpense.category}</p>
                <p> <span className="label">Amount:</span> ${stats.latestExpense.amount}</p>
                <p> <span className="label">Date:</span> {stats.latestExpense.date}</p>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const ExpenseForm = ({ expense, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    category: expense?.category || '',
    description: expense?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div>
        <label>Amount</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
        />
      </div>

      <div>
        <label>Date</label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
        />
      </div>

      <div>
        <label>Category</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">-- Select a Category --</option>
          <option value="Groceries">Groceries</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Dining">Dining</option>
          <option value="Merchandise">Merchandise</option>
          <option value="Travel">Travel</option>
          <option value="Housing">Housing</option>
          <option value="Transportation">Transportation</option>
          <option value="Utilities">Utilities</option>
          <option value="Investments">Investments</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="3"
        />
      </div>

      <div>
        <button className="button-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button" disabled={false}>
          Save
        </button>
      </div>
    </form>
  );
};

const IncomeForm = ({ income, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: income?.title || '',
    amount: income?.amount || '',
    date: income?.date || new Date().toISOString().split('T')[0],
    category: income?.category || '',
    description: income?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div>
        <label>Amount</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
        />
      </div>

      <div>
        <label>Date</label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
        />
      </div>

      <div>
        <label>Category</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">-- Select a Category --</option>
          <option value="Salary/Wages">Salary/Wages</option>
          <option value="Bonus">Bonus</option>
          <option value="Freelance/Side Hustle">Freelance/Side Hustle</option>
          <option value="Business Income">Business Income</option>
          <option value="Rental Income">Rental Income</option>
          <option value="Investments/Dividends">Investments/Dividends</option>
          <option value="Gifts">Gifts</option>
          <option value="Refunds/Reimbursements">Refunds/Reimbursements</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="3"
        />
      </div>

      <div>
        <button className="button-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button" disabled={false}>
          Save
        </button>
      </div>
    </form>
  );
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseService.getAll();
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingExpense) {
        await expenseService.update(editingExpense.id, formData);
      } else {
        await expenseService.create(formData);
      }
      fetchExpenses();
      setShowForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Expenses</h1>
        <button type="button" className="button" onClick={() => setShowForm(true)}>
          <PlusCircle /> Add Expense
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <ExpenseForm
            expense={editingExpense}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingExpense(null);
            }}
          />
        </div>
      )}

      <div>
        <ul>
          {expenses.map((expense) => (
            <li key={expense.id}>
              <div>
                <p>
                  <span className="label">Title:</span> {expense.title}
                </p>
                <p>
                  <span className="label">Amount:</span> -${expense.amount}
                </p>
                <p>
                  <span className="label">Category:</span> {expense.category}
                </p>
                <p>
                  <span className="label">Date:</span> {expense.date}
                </p>
                {expense.description && (
                  <p>
                    <span className="label">Description:</span> {expense.description}
                  </p>
                )}
              </div>
              <div>
                <button type="button" className="button" onClick={() => handleEdit(expense)}>
                  <Edit />
                </button>
                <button className="button-cancel" onClick={() => handleDelete(expense.id)}>
                  <Trash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {expenses.length === 0 && (
          <div className="loading">
            <p>No expenses found. Add your first expense!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await incomeService.getAll();
      setIncomes(response.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingIncome) {
        await incomeService.update(editingIncome.id, formData);
      } else {
        await incomeService.create(formData);
      }
      fetchIncomes();
      setShowForm(false);
      setEditingIncome(null);
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeService.delete(id);
        fetchIncomes();
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Income</h1>
        <button type="button" className="button" onClick={() => setShowForm(true)}>
          <PlusCircle /> Add Income
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingIncome ? 'Edit Income' : 'Add New Income'}</h2>
          <IncomeForm
            income={editingIncome}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingIncome(null);
            }}
          />
        </div>
      )}

      <div>
        <ul>
          {incomes.map((income) => (
            <li key={income.id}>
              <div>
                <p>
                  <span className="label">Title:</span> {income.title}
                </p>
                <p>
                  <span className="label">Amount:</span> ${income.amount}
                </p>
                <p>
                  <span className="label">Category:</span> {income.category}
                </p>
                <p>
                  <span className="label">Date:</span> {income.date}
                </p>
                {income.description && (
                  <p>
                    <span className="label">Description:</span> {income.description}
                  </p>
                )}
              </div>
              <div>
                <button type="button" className="button" onClick={() => handleEdit(income)}>
                  <Edit />
                </button>
                <button className="button-cancel" onClick={() => handleDelete(income.id)}>
                  <Trash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {incomes.length === 0 && (
          <div className="loading">
            <p>No income found. Add your first income entry!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Statistics = () => {
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chartResponse, statsResponse] = await Promise.all([
        statsService.getChartData(),
        statsService.getStats()
      ]);
      setChartData(chartResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!chartData) return [];
    const dateMap = new Map();
    chartData.expenseList?.forEach(expense => {
      const date = expense.date;
      if (!dateMap.has(date)) dateMap.set(date, { date, income: 0, expense: 0 });
      dateMap.get(date).expense += expense.amount;
    });
    chartData.incomeList?.forEach(income => {
      const date = income.date;
      if (!dateMap.has(date)) dateMap.set(date, { date, income: 0, expense: 0 });
      dateMap.get(date).income += income.amount;
    });
    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const prepareCategoryData = () => {
    if (!chartData) return [];
    const categoryMap = new Map();
    chartData.expenseList?.forEach(expense => {
      const category = expense.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + expense.amount);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const lineChartData = prepareChartData();
  const pieChartData = prepareCategoryData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  return (
    <div className="container">
      <h1>Statistics</h1>

      <div className="stats-grid">
        <div className="card">
          <div className="icon"><TrendingUp /></div>
          <dl>
            <dt>Total Income</dt>
            <dd>${stats?.income?.toFixed(2) || '0.00'}</dd>
          </dl>
        </div>

        <div className="card">
          <div className="icon"><TrendingDown /></div>
          <dl>
            <dt>Total Expenses</dt>
            <dd>${stats?.expense?.toFixed(2) || '0.00'}</dd>
          </dl>
        </div>

        <div className="card">
          <div className="icon"><DollarSign /></div>
          <dl>
            <dt>Balance</dt>
            <dd>${stats?.balance?.toFixed(2) || '0.00'}</dd>
          </dl>
        </div>
      </div>

      {lineChartData.length > 0 && (
        <div className="card">
          <h2>Income vs Expenses (Last 28 Days)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {pieChartData.length > 0 && (
        <div className="card">
          <h2>Expenses by Category</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/income"
            element={
              <ProtectedRoute>
                <Income />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;