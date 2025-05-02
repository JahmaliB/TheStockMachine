import React from 'react';
import '../App.css';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>The Stock Machine</h1>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="app-footer">
      </footer>
    </div>
  );
};

export default Layout;