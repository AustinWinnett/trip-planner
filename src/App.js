import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import SingleTrip from "./pages/SingleTrip";
import MyTrips from "./pages/MyTrips";
import SignIn from "./pages/SignIn";
import AuthForm from "./components/AuthForm";
import Navbar from "./components/Navbar";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Home /> : <AuthForm />} />
        <Route path="/my-trips" element={user ? <MyTrips /> : <SignIn />} />
        <Route path="/trip/:id" element={<SingleTrip />}></Route>
        <Route path="/auth" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

export default App;