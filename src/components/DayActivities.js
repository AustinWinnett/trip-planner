import { Droppable, Draggable } from "react-beautiful-dnd";

function DayActivities({ day, activities, deleteActivity }) {
  const formatTime = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "pm" : "am";
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:${minute.toString().padStart(2, "0")}${period}`;
  };

  return (
    <Droppable droppableId={day}>
      {(provided) => (
        <div className="activities-list" data-count-activities={activities.length}>
          <h3 className="text-lg font-bold mb-3">Activities</h3>
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[50px] p-2 bg-white rounded mb-5">
            {activities.map((activity, index) => (
              <Draggable key={activity.id} draggableId={activity.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-gray-100 p-2 mb-2 rounded cursor-grab last:mb-0"
                  >
                    <div className="flex gap-x-2">
                      <span>{activity.name} - {formatTime(activity.time)}</span><button onClick={() => deleteActivity(day, activity.id)}className="text-red-600 hover:underline cursor-pointer">Delete</button>
                    </div>

                    {activity.description && (
                      <p className="text-sm max-w-[500px] mt-1 text-gray-600">{activity.description}</p>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default DayActivities;