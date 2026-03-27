import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Login1 from "./pages/Login1";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Demos from "./pages/Demos";
import Help from "./pages/Help";


// Redirect to login if no token saved
function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/Home" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Home"     element={<Home />} />
        <Route path="/Features"     element={<Features />} />
        <Route path="/Demos"     element={<Demos />} />
        <Route path="/Help"  element={<Help />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/login1"     element={<Login1 />} /> 
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/Home" />} />
      </Routes>
    </BrowserRouter>
  );
}