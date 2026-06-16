import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Header from './components/Header/Header.tsx'
import Footer from './rmz-ui/components/Footer.tsx'
import Dashboard from './pages/Dashboard/Dashboard.tsx'
import Projects from './pages/Projects/Projects.tsx';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
