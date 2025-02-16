import { useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const AddTrip = () => {
  const [tripName, setTripName] = useState("");

  const handleAddTrip = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "trips"), {
        name: tripName,
        createdAt: new Date(),
      });

      setTripName("");
    } catch (error) {
      console.error("Error adding trip: ", error);
    }
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-5">Add a New Trip</h2>
      <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Trip Name"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
        />
        <button className="bg-blue-500 text-white font-bold inline-block p-3 px-6 cursor-pointer hover:bg-blue-600 duration-150" onClick={handleAddTrip}>Add Trip</button>
      </form>
    </div>
  );
}

export default AddTrip;