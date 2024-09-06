import './App.css'
import './styles/fonts.css'
import { View, Movie } from "./pages/Box.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import ImageResizer from "./pages/ImageResizer.jsx";
import {Route, Routes} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  return (
          <Routes>
              <Route path="/3d" element={<View />}/>
              <Route path="/rszr" element={<ImageResizer />}/>
              <Route path="/movie" element={<Movie />}/>
              <Route index path="/" element={<Portfolio />}/>
          </Routes>
  )
}


export default App;
