"use client";

import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import _ from "lodash";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faFile } from "@fortawesome/free-regular-svg-icons";
import {
  faCirclePlus,
  faEllipsis,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

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
      items: [
        {
          id: "dfjk",
          comments: [],
          createdAt: new Date(),
          description: "Some description",
          title: "Some title",
          updatedAt: new Date(),
        },
      ],
    },
    "In progress": {
      title: "In Progress",
      items: [],
    },
    done: {
      title: "Done",
      items: [],
    },
  });

  // Load  the state from local storage
  useEffect(() => {
    const localState = localStorage.getItem("todo-board");
    if (!localState) return;

    const data = JSON.parse(localState);
    setState(data);
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
    console.log(state);
    const data = JSON.stringify(state);
    localStorage.setItem("todo-board", data);
  };

  const handleAddNewTask = (column: string) => {
    const newTask: TodoItem = {
      id: _.uniqueId(),
      comments: [],
      createdAt: new Date(),
      description: "",
      title: "",
      updatedAt: new Date(),
    };

    const columnState = state[column];
    columnState.items.push(newTask);

    setState({ ...state });

    // Save the changes
    console.log(state);
    const data = JSON.stringify(state);
    localStorage.setItem("todo-board", data);
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-5">
        <FontAwesomeIcon icon={faFile} size="2x" />
        <div className="text-2xl font-medium">Kanban Desk</div>
      </div>
      <div className="grid grid-cols-3 gap-10 mt-10 w-full items-start border-2 border-[#939393] rounded-lg p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          {_.map(state, (data, key) => {
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
                    onClick={() => handleAddNewTask(key)}
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
                                      <div>
                                        <button className="border  px-2 py-1 rounded-lg">
                                          <FontAwesomeIcon
                                            icon={faEllipsis}
                                            className="text-accent-3"
                                          />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="mt-14 flex items-center justify-between">
                                      <div className="px-3 py-2 bg-[#FFF5EF] rounded-lg text-sm text-accent-2 font-medium">
                                        {item.updatedAt.toLocaleDateString(
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
