import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, doc, getDoc, deleteDoc, onSnapshot, addDoc } from 'firebase/firestore';

function SingleTrip() {
  const { id } = useParams();  // Get the trip ID from the URL
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const tripRef = doc(db, "users", user.uid, "trips", id);

    // Fetch trip details
    const fetchTrip = async () => {
      const tripSnap = await getDoc(tripRef);
      if (tripSnap.exists()) {
        setTrip({ id: tripSnap.id, ...tripSnap.data() });
      } else {
        console.log("Trip not found");
      }
    };

    fetchTrip();

    // Fetch activities in real time
    const activitiesRef = collection(tripRef, "activities");
    const unsubscribe = onSnapshot(activitiesRef, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();

  }, [id]);

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const tripRef = doc(db, "users", user.uid, "trips", trip.id);  // Reference to the trip to be deleted

    try {
      await deleteDoc(tripRef);  // Delete the trip from Firestore
      navigate("/my-trips");  // Redirect to home page after deletion
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  // Add a new activity
  const handleAddActivity = async () => {
    if (!newActivity.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    try {
      const activitiesRef = collection(db, "users", user.uid, "trips", id, "activities");
      await addDoc(activitiesRef, { name: newActivity });
      setNewActivity(""); // Clear input field
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  // Delete an activity
  const handleDeleteActivity = async (activityId) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    try {
      const activityRef = doc(db, "users", user.uid, "trips", id, "activities", activityId);
      await deleteDoc(activityRef);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  if (!trip) {
    return (
      <div className="py-16">
        <div className="container">
          <p>Trip not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="container">
        <Link to="/my-trips" className="text-blue-500 hover:underline mb-5 inline-flex gap-x-2"><span>←</span>Back to Trips</Link>
        <h1 className="text-4xl font-bold mb-5">{trip.name}</h1>
        <div className="mb-8">
          <p>Created at: {trip.createdAt?.toDate().toLocaleString()}</p>
        </div>

        <h2 className="text-2xl font-bold mb-5">Activities</h2>
        <ul className="space-y-4 mb-5">
          {activities.map(activity => (
            <li key={activity.id}>
              {activity.name}
              <button className="text-red-600 ml-4" onClick={() => handleDeleteActivity(activity.id)}>Delete</button>
            </li>
          ))}
        </ul>

        <form className="flex gap-x-2 mb-5" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="New activity name"
          />
          <button className="btn" onClick={handleAddActivity}>Add Activity</button>
        </form>

        <button onClick={handleDelete} className="text-red-600 hover:underline cursor-pointer">Delete Trip</button>
      </div>
    </div>
  );
}

export default SingleTrip;