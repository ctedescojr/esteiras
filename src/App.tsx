import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/themes';
import { GlobalStyle } from './styles/global';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import styled from 'styled-components';

const Nav = styled.nav`
  padding: 1rem 2rem;
  background-color: #0c144f;
  border-bottom: 1px solid ${({ theme }) => theme.toggleBorder};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #FFFFFF;
  text-decoration: none;
  margin: 0 1rem;
`;

const ThemeToggleButton = styled.button`
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <Router>
        <Nav>
          <div>
            <NavLink to="/">Calculadora</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </div>
          <ThemeToggleButton onClick={toggleTheme}>
            Mudar para tema {theme === 'light' ? 'Escuro' : 'Claro'}
          </ThemeToggleButton>
        </Nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
