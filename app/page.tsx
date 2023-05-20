"use client";

import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faFile } from "@fortawesome/free-regular-svg-icons";
import {
  faCirclePlus,
  faEllipsis,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/Modal";
import MoreOptionButton from "@/components/MoreOptionButton";

type Column = "todo" | "in progress" | "done";

type TodoBoard = Record<string, TodoCol>;

type TodoCol = {
  title: string;
  items: TodoItem[];
};

type TodoItem = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  comments: [];
};

export default function Home() {
  const [state, setState] = useState<TodoBoard>({
    todo: {
      title: "Todo",
      items: [],
    },
    "in progress": {
      title: "In Progress",
      items: [],
    },
    done: {
      title: "Done",
      items: [],
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<Column>("todo");
  const [currentTask, setCurrentTask] = useState<TodoItem>();

  // Load  the state from local storage
  useEffect(() => {
    const localState = localStorage.getItem("todo-board");
    if (!localState) return;

    const todoData = JSON.parse(localState);

    const transportTodoData = _.map(todoData, (data, key) => {
      return {
        ...data,
        items: _.map(data.items, (item) => {
          return {
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          };
        }),
      };
    });

    setState({
      todo: transportTodoData[0],
      "In progress": transportTodoData[1],
      done: transportTodoData[2],
    });
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = state[source.droppableId];
    const destinationColumn = state[destination.droppableId];
    const item = sourceColumn.items[source.index];

    // Remove item from the source column
    sourceColumn.items.splice(source.index, 1);

    // Add item to the destination column
    destinationColumn.items.splice(destination.index, 0, item);

    setState({ ...state });

    // Save the changes
    const data = JSON.stringify(state);
    localStorage.setItem("todo-board", data);
  };

  const handleAddNewTask = (
    { description, title }: { title: string; description: string },
    column: string
  ) => {
    const newTask: TodoItem = {
      id: _.uniqueId(),
      comments: [],
      createdAt: new Date(),
      description,
      title,
      updatedAt: new Date(),
    };

    const columnState = state[column];
    columnState.items.push(newTask);

    setState({ ...state });

    // Save the changes
    const data = JSON.stringify(state);
    localStorage.setItem("todo-board", data);
  };

  const handleEditTask = (id: string, column: Column) => {
    const columnState = state[column];
    const task = columnState.items.find((item) => item.id === id);

    setIsEditing(true);

    if (!task) return;

    setCurrentTask(task);
    setIsModalOpen(true);
    setCurrentColumn(column);
  };

  const handleDeleteTask = (id: string, column: Column) => {
    const columnState = state[column];

    columnState.items = columnState.items.filter((item) => item.id !== id);
    setState({ ...state, [column]: columnState });

    // Save to local storage
    localStorage.setItem("todo-board", JSON.stringify(state));
  };

  return (
    <div className="px-6 py-4">
      <Modal
        isOpen={isModalOpen}
        columnState={currentColumn}
        defaultFormData={{
          title: currentTask?.title || "",
          description: currentTask?.description || "",
        }}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={(e, data) => {
          e.preventDefault();

          // Update task
          if (isEditing) {
            const columnState = state[data.columnState];
            const task = columnState.items.find(
              (item) => item.id === currentTask?.id
            );
            if (!task) return;
            task.title = data.title;
            task.description = data.description;
            task.updatedAt = new Date();
            setState({ ...state });
            setIsEditing(false);

            // Set to local storage
            localStorage.setItem("todo-board", JSON.stringify(state));
          } else {
            // Create new task
            handleAddNewTask(
              { title: data.title, description: data.description },
              data.columnState
            );
          }

          setIsModalOpen(false);
          setCurrentTask(undefined);
        }}
      />
      <div className="flex items-center gap-5">
        <FontAwesomeIcon icon={faFile} size="2x" />
        <div className="text-2xl font-medium">Kanban Desk</div>
      </div>
      <div className="grid grid-cols-3 gap-10 mt-10 w-full items-start border-2 border-[#939393] rounded-lg p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          {_.map(state, (data, key: "todo" | "in progress" | "done") => {
            return (
              <div key={key}>
                <div
                  className="flex items-center justify-between px-3 py-4 mb-7 border-2 border-[#A9A9AA] rounded-lg bg-[#FCFCFC]"
                  style={{ boxShadow: "1px 1px 2px #828282" }}
                >
                  <h3 className="text-base font-semibold capitalize text-accent-1">
                    {key}
                  </h3>
                  <button
                    className="flex items-center gap-2 text-sm text-gray-500"
                    onClick={() => {
                      setIsModalOpen(true);
                      setCurrentColumn(key);
                    }}
                  >
                    <FontAwesomeIcon icon={faCirclePlus} />
                    <span className="uppercase font-medium text-[#343539]">
                      Add new task
                    </span>
                  </button>
                </div>
                <Droppable droppableId={key}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="bg-white flex flex-col gap-5"
                      >
                        {data.items.map((item, index) => {
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="p-5 rounded-lg border-2 border-[#EDEDED] bg-white"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h3 className="text-lg font-semibold leading-4 text-accent-2">
                                          {item.title}
                                        </h3>
                                        <small className="text-sm text-accent-3 font-medium">
                                          {item.description}
                                        </small>
                                      </div>
                                      <MoreOptionButton
                                        onEdit={() =>
                                          handleEditTask(item.id, key)
                                        }
                                        onDelete={() =>
                                          handleDeleteTask(item.id, key)
                                        }
                                      />
                                    </div>

                                    <div className="mt-14 flex items-center justify-between">
                                      <div className="px-3 py-2 bg-[#FFF5EF] rounded-lg text-sm text-accent-2 font-medium">
                                        {item.updatedAt?.toLocaleDateString(
                                          "en",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          }
                                        )}
                                      </div>

                                      <div>
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                              icon={faComments}
                                              className="text-accent-3"
                                            />
                                            <span className="text-sm text-accent-3">
                                              4
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                              icon={faLink}
                                              className="text-accent-3"
                                            />
                                            <span className="text-sm text-accent-3">
                                              4
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}
