import { useState } from "react";

function AddActivity({ addActivity, day }) {
  const [activityName, setActivityName] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const handleAddActivity = async (e) => {
    e.preventDefault();

    const newActivity = {
      name: activityName,
      time: time,
      description: description,
    };

    await addActivity(day, newActivity);
    setActivityName("");
    setTime("");
    setDescription("");
  };

  return (
    <form className="flex gap-2 items-end" onSubmit={(e) => e.preventDefault()}>
      <div>
        <div className="flex gap-2">
          <input type="text" value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="Activity Name" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <textarea className="w-full mt-2 align-bottom" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
      </div>
      <button onClick={handleAddActivity} className="btn">Add Activity</button>
    </form>
  );
}

export default AddActivity;
