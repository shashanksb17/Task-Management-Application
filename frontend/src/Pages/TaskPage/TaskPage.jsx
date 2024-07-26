import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import axios from "axios";
import "./TaskPage.css";
import { TaskCard } from "./TaskCard";
import { message } from "antd";
import { Loader } from "../../Components/Loader/Loader";

export const TaskPage = ({ taskData, fetchTaskData }) => {
  const [load, setLoad] = useState(false);
  if (!taskData) return <p>Loading...</p>;

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    let payload = {};
    if (destination.droppableId === "progress") {
      payload = { in_progress: true };
    } else if (destination.droppableId === "completed") {
      payload = { is_completed: true };
    } else if (destination.droppableId === "task") {
      payload = { in_progress: false, is_completed: false };
    }

    const token = localStorage.getItem("userToken");
    setLoad(true);
    axios
      .patch(`https://voosh-assignment-4zan.onrender.com/task/edit/${draggableId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        message.success("Task Moved Successfully");
        fetchTaskData();
        setLoad(false);
      })
      .catch((err) => {
        console.error("Error moving task", err);
        setLoad(false);
      });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {load ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Loader />
        </div>
      ) : (
        <div style={{display:"flex", justifyContent:"center", flexWrap:"wrap"}}>
        <div className="task-page">
          {["task", "progress", "completed"].map((column) => (
            <Droppable droppableId={column} key={column}>
              {(provided) => (
                <div
                  className="task-column"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h3>{column}</h3>
                  <TaskCard
                    taskData={taskData[column]}
                    fetchTaskData={fetchTaskData}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
        </div>
      )}
    </DragDropContext>
  );
};
