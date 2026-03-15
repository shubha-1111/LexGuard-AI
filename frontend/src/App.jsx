import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Cases from "./pages/Cases";
import NewCase from "./pages/NewCase";
import DocumentAnalyzer from "./pages/DocumentAnalyzer";
import CaseDetails from "./pages/CaseDetails";
import LegalChat from "./pages/LegalChat";
import Hearings from "./pages/Hearings";
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/cases"
          element={
            <PrivateRoute>
              <Cases />
            </PrivateRoute>
          }
        />

        <Route
          path="/cases/new"
          element={
            <PrivateRoute>
              <NewCase />
            </PrivateRoute>
          }
        />

        <Route
          path="/cases/:id"
          element={
            <PrivateRoute>
              <CaseDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <PrivateRoute>
              <DocumentAnalyzer />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/legal-chat"
          element={
           <PrivateRoute>
              <LegalChat />
           </PrivateRoute>
          }
       />
      
       <Route
         path="/hearings"
         element={
           <PrivateRoute>
             <Hearings />
           </PrivateRoute>
        } 
      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;