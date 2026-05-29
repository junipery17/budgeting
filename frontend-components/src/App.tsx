import { Routes, Route } from "react-router-dom";
import Accounts from './components/Accounts';
import Main_Page from './components/Main_Page';
import Budgets from "./components/Budgets";
import Visualizations from "./components/Visualizations";
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Accounts />} />
        <Route path="main/:accountId" element={<Main_Page />} />
        <Route path="/budgets/:totalId" element={<Budgets />} />
        <Route path="/visualizations/:accountId" element={<Visualizations />} />
      </Routes>
    </>
  )
}

export default App
