import TripList from "../components/TripList";
import AddTrip from "../components/AddTrip";

function MyTrips() {
  return (
    <div class="py-16">
      <div className="container">
        <AddTrip />
        <TripList />
      </div>
    </div>
  );
}

export default MyTrips;