import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Cases from "./pages/Cases";
import NewCase from "./pages/NewCase";
import DocumentAnalyzer from "./pages/DocumentAnalyzer";
import CaseDetails from "./pages/CaseDetails";
import LegalChat from "./pages/LegalChat";
import Hearings from "./pages/Hearings";
import RiskAnalyzer from "./pages/RiskAnalyzer";
import DocumentDrafter from "./pages/DocumentDrafter";
import Translator from "./pages/Translator";
import Calendar from "./pages/Calendar";
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
        <Route
          path="/risk-analyzer"
          element={
            <PrivateRoute>
              <RiskAnalyzer />
            </PrivateRoute>
          }
        />
        <Route
          path="/drafter"
          element={
            <PrivateRoute>
              <DocumentDrafter />
            </PrivateRoute>
          }
        />
        <Route
          path="/translator"
          element={
            <PrivateRoute>
              <Translator />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;