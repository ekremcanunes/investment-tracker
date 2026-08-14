import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/700.css'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.jsx'
import { APP_NAME } from './lib/app'

document.title = APP_NAME

createRoot(document.getElementById('root')).render(<App />)
