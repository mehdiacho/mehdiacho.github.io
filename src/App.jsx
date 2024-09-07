import './App.css'
import './styles/fonts.css'
import { View, Movie } from "./pages/Box.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import ImageResizer from "./pages/ImageResizer.jsx";
import UnderConstruction from "./pages/components/UnderConstruction.jsx";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/3d" element={<View />}/>
        <Route path="/rszr" element={<ImageResizer />}/>
        <Route path="/movie" element={<Movie />}/>
        <Route index path="/" element={<UnderConstruction />}/>
        <Route path="/portfolio" element={<Portfolio />}/>
      </Routes>
    </ThemeProvider>
  )
}

export default App;
