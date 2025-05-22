import React from 'react'
import ReactDOM from 'react-dom'
// import { Provider } from 'react-redux'
// import { BrowserRouter } from 'react-router-dom'
// import { ThemeProvider } from '@mui/material/styles'
// import CssBaseline from '@mui/material/CssBaseline'

import App from './App'
// import { store } from '@/store'
// import theme from '@/theme'

// Import the CSS file
import './index.css'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// DRASTICALLY SIMPLIFIED RENDER FOR DEBUGGING
ReactDOM.render(
  <App />,
  rootElement
);
