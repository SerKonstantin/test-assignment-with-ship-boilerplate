import React, { memo } from 'react';
import { Paper, Text } from '@mantine/core';
import { Draggable } from '@hello-pangea/dnd';

import { JobApplication } from 'types';

interface ApplicationCardProps {
  application: JobApplication;
  index: number;
  onCardClick: (clickedApp: JobApplication) => void;
}

export const ApplicationCard = memo(({ application, index, onCardClick }: ApplicationCardProps) => (
  <Draggable draggableId={application._id} index={index}>
    {(provided) => (
      <Paper
        p="sm"
        withBorder
        mb="sm"
        ref={provided.innerRef}
        onClick={() => onCardClick(application)}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Text fw={500}>{application.position}</Text>
        <Text size="sm">{application.company}</Text>
        <Text size="xs" c="dimmed">
          ${application.salaryMin} - ${application.salaryMax}
        </Text>

        {/* TODO: remove after debugging */}
        <Text size="xs" c="blue">
          Debug: sortIndex={application.sortIndex}, index={index}
        </Text>
      </Paper>
    )}
  </Draggable>
));
