import axios from 'axios';

const BASE_URL = 'https://6831f4a8c3f2222a8cb0fa7e.mockapi.io/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface User {
  id?: string;
  username: string;
  password: string;
  createdAt?: number;
}

export interface Expense {
  id?: string;
  title: string;
  description: string;
  amount: number;
  ownerid: string;
  createdAt?: number;
  category?: string;
}

export const userApi = {
  register: (userData: User) => api.post('/users', userData),
  login: (username: string) => api.get(`/users?username=${username}`,{
    validateStatus: (status) => status >= 200 && status < 300 || status === 404
  }),
  getUser: (userId: string) => api.get(`/users/${userId}`,{
    validateStatus: (status) => status >= 200 && status < 300 || status === 404
  })
};

export const expenseApi = {
  getExpenses: (userId: string) => api.get(`/expenses?ownerid=${userId}`,{
    validateStatus: (status) => status >= 200 && status < 300 || status === 404
  }),
  addExpense: (expenseData: Expense) => api.post('/expenses', expenseData),
  updateExpense: (id: string, expenseData: Partial<Expense>) => 
    api.put(`/expenses/${id}`, expenseData),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`)
};

export default api;