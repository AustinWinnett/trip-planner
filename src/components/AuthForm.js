import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AuthForm() {
  const { user } = useAuth(); // Get user from AuthContext
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  if (user) {
    navigate("/"); // Redirect logged-in users
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-5">{isLogin ? "Sign In" : "Sign Up"}</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form className="flex gap-x-2" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn" type="submit">{isLogin ? "Sign In" : "Sign Up"}</button>
      </form>
      <button className="mt-3 text-sm text-blue-500 hover:underline cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
      </button>
    </div>
  );
}

export default AuthForm;
