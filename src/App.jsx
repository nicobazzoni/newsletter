// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NewsletterSPA from './components/NewsLetterSPA';
import NewsletterDetail from './pages/NewsletterDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<NewsletterSPA />} />
      <Route path="/newsletter/:id" element={<NewsletterDetail />} />
    </Routes>
  );
}