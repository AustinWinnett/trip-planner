import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import logo from "../logo.svg";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/auth"); // Redirect to the login/signup page
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <nav className="navbar bg-gray-800 text-white p-3">
      <div className="container">
        <div className="flex justify-between items-center">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 w-auto mr-4" /> {/* Adjust size as needed */}
          </Link>

          <ul className="flex gap-x-4">
            <li><Link to="/">Home</Link></li>
            {user && <li><Link to="/my-trips">My Trips</Link></li>}
            {user && <li><button onClick={handleSignOut}>Sign Out</button></li>}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;