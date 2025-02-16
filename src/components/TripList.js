import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const TripList = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const tripsRef = collection(db, "users", user.uid, "trips");
    const unsubscribe = onSnapshot(tripsRef, (snapshot) => {
      setTrips(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-8 first:mt-0">
      <div>
        <h2 className="text-4xl font-bold mb-5">My Trips</h2>

        {trips.length > 0 ? (
          <ul className="space-y-2 list-disc ml-5">
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link to={`/trip/${trip.id}`} className="hover:underline">{trip.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No trips found.</p>
        ) }
      </div>
    </div>
  )
}

export default TripList;