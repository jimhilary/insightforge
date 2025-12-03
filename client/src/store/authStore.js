import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  
  setUser: (user) => {
    set({ user });
    // Also store in localStorage
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  },
  
  setToken: (token) => {
    set({ token });
    // Also store in localStorage
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  },
  
  setLoading: (loading) => set({ loading }),
  
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  },
  
  // Initialize from localStorage
  init: () => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      set({ 
        user: JSON.parse(storedUser), 
        token: storedToken 
      });
    }
  },
}));

export default useAuthStore;

