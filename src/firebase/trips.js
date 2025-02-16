import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export const addTrip = async ( userId, tripName ) => {
  try {
    const tripRef = collection(db, `users/${userId}/trips`);
    const docRef = await addDoc(tripRef, { name: tripName, createdAt: new Date() } );
    return docRef.id;
  } catch (error) {
    console.error("Error adding trip: ", error);
  }
};