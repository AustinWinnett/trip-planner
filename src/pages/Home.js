import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Home() {
  const { user } = useAuth();

  return (
    <div className="py-16">
      <div className="container">
        <h1 className="text-4xl font-bold mb-5">Welcome, {user ? user.email : "Guest"}</h1>
        <Link to="/my-trips" className="btn">Check out your trips</Link>
      </div>
    </div>
  );
}

export default Home;