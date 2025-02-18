import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs, addDoc, doc, deleteDoc, onSnapshot, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import AddActivity from "../components/AddActivity";
import DayActivities from "../components/DayActivities";
import { DragDropContext } from "react-beautiful-dnd";


function SingleTrip() {
  const { id } = useParams();  // Get the trip ID from the URL
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  // Get all the user's trips
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const tripRef = doc(db, "users", user.uid, "trips", id);
    const unsubscribe = onSnapshot(tripRef, (docSnap) => {
      if (docSnap.exists()) {
        const tripData = docSnap.data();
        setTrip(tripData);
        setStartDate(tripData.startDate || "");
        setEndDate(tripData.endDate || "");
        generateDays(tripData.startDate, tripData.endDate);
      }
    });

    return () => unsubscribe();
  }, [id]);

  // Generate days based on date range
  function generateDays(start, end) {
    if (!start || !end) return;
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const daysArr = [];

    while (startDateObj <= endDateObj) {
      startDateObj.setDate(startDateObj.getDate() + 1);
      daysArr.push(new Date(startDateObj).toISOString().split("T")[0]); // YYYY-MM-DD
    }

    setDays(daysArr);
  }

  // Save date range to Firestore
  async function handleSaveDates() {
    const user = auth.currentUser;
    if (!user || !startDate || !endDate) return;

    const tripRef = doc(db, "users", user.uid, "trips", id);
    await updateDoc(tripRef, { startDate, endDate });

    // Create empty day documents
    for (const day of days) {
      const dayRef = doc(db, "users", user.uid, "trips", id, "days", day);
      await setDoc(dayRef, { date: day }, { merge: true });
    }
  }

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const tripRef = doc(db, "users", user.uid, "trips", id); // Reference to the trip
    const daysRef = collection(db, "users", user.uid, "trips", id, "days"); // Reference to days collection

    try {
      // Get all days
      const daysSnapshot = await getDocs(daysRef);
      const deletePromises = [];

      for (const dayDoc of daysSnapshot.docs) {
        const activitiesRef = collection(db, "users", user.uid, "trips", id, "days", dayDoc.id, "activities");

        // Get all activities for the day
        const activitiesSnapshot = await getDocs(activitiesRef);

        // Queue activity deletions
        activitiesSnapshot.docs.forEach((activityDoc) => {
          deletePromises.push(deleteDoc(activityDoc.ref));
        });

        // Queue day deletion
        deletePromises.push(deleteDoc(dayDoc.ref));
      }

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Now delete the trip document
      await deleteDoc(tripRef);

      // Redirect after deletion
      navigate("/my-trips");
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  // Load the activities
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchActivities = async () => {
      const newActivities = {};

      for (const day of days) {
        const activitiesRef = collection(db, "users", user.uid, "trips", id, "days", day, "activities");
        const q = query(activitiesRef, orderBy("time", "asc"));
        const snapshot = await getDocs(q);
        newActivities[day] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      setActivities(newActivities);
    };

    if (days.length) fetchActivities();
  }, [days, id]);

  const addActivity = async (day, newActivity) => {
    if (!trip) return;

    const activityRef = doc(db, "users", user.uid, "trips", id, "days", day);
    const activitiesRef = collection(activityRef, "activities");

    try {
      await addDoc(activitiesRef, newActivity);

      // Reload all activities for the day, in order
      const snapshot = await getDocs(query(activitiesRef, orderBy("time")));

      setActivities(prev => ({
        ...prev,
        [day]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }));
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const deleteActivity = async (day, activityId) => {
    const user = auth.currentUser;
    if (!user) return;

    const activityRef = doc(db, "users", user.uid, "trips", id, "days", day, "activities", activityId);

    try {
      await deleteDoc(activityRef);

      // Update local state to remove the activity
      setActivities(prev => ({
        ...prev,
        [day]: prev[day].filter(activity => activity.id !== activityId),
      }));
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const user = auth.currentUser;
    if (!user) return;

    const sourceDay = source.droppableId;
    const destinationDay = destination.droppableId;

    if (sourceDay === destinationDay) return;

    const movedActivity = activities[sourceDay].find(act => act.id === draggableId);

    const sourceRef = doc(db, "users", user.uid, "trips", id, "days", sourceDay, "activities", draggableId);
    const destinationRef = doc(db, "users", user.uid, "trips", id, "days", destinationDay, "activities", draggableId);

    try {
      await deleteDoc(sourceRef);
      await setDoc(destinationRef, movedActivity);

      // Reload all activities for the destination day
      const activitiesRef = collection(db, "users", user.uid, "trips", id, "days", destinationDay, "activities");
      const snapshot = await getDocs(query(activitiesRef, orderBy("time")));

      setActivities(prev => ({
        ...prev,
        [sourceDay]: prev[sourceDay].filter(act => act.id !== draggableId),
        [destinationDay]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }));
    } catch (error) {
      console.error("Error moving activity:", error);
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
        <div className="flex gap-x-5 mb-5 items-end">
          <h1 className="text-4xl font-bold">{trip.name}</h1>
          <button onClick={handleDelete} className="text-red-600 hover:underline cursor-pointer">Delete Trip</button>
        </div>

        <form className="flex gap-x-2 mb-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-bold mb-1 block">Start Date: </label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-bold mb-1 block">End Date:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex flex-col justify-between">
            <span className="block h-6"></span>
            <button onClick={handleSaveDates} className="btn flex-1">Save Dates</button>
          </div>
        </form>

        <div>
          <DragDropContext onDragEnd={onDragEnd}>
            {days.map((day) => (
              <div key={day}>
                <h3 className="text-xl font-bold mb-3">{new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(day))}</h3>
                <div key={day} className="bg-gray-100 border border-gray-300 p-5 mb-5">
                  <DayActivities
                    day={day}
                    key={day}
                    activities={activities[day] || []}
                    deleteActivity={deleteActivity}
                  />
                  <AddActivity addActivity={addActivity} day={day} />
                </div>
              </div>
            ))}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}

export default SingleTrip;