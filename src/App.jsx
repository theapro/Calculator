import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Calculator from "./components/Calculator";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Calculator />} />       
      </Routes> 
    </Router>
  );
};

export default App;

