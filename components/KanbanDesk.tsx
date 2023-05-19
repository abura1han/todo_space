'use client'

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Card {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface KanbanDeskProps {
  columns: Column[];
}

const KanbanDesk: React.FC<KanbanDeskProps> = ({ columns }) => {
  const [columnData, setColumnData] = useState(columns);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = columnData.find((column) => column.id === source.droppableId);
    const endColumn = columnData.find((column) => column.id === destination.droppableId);

    if (!startColumn || !endColumn) {
      return;
    }

    const startCards = [...startColumn.cards];
    const endCards = [...endColumn.cards];
    const [draggedCard] = startCards.splice(source.index, 1);
    endCards.splice(destination.index, 0, draggedCard);

    const newColumnData = columnData.map((column) => {
      if (column.id === startColumn.id) {
        return { ...column, cards: startCards };
      } else if (column.id === endColumn.id) {
        return { ...column, cards: endCards };
      }
      return column;
    });

    setColumnData(newColumnData);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-desk flex space-x-4">
        {columnData.map((column) => (
          <div key={column.id} className="column flex flex-col bg-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="cards-container"
                >
                  {column.cards.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="card bg-white rounded-lg p-2 mb-2"
                        >
                          {card.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanDesk;
