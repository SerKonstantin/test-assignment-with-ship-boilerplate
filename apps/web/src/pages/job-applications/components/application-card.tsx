import React, { memo } from 'react';
import { Paper, Text } from '@mantine/core';
import { Draggable } from '@hello-pangea/dnd';
import cx from 'clsx';

import { JobApplication } from 'types';

import classes from './application-card.module.css';

interface ApplicationCardProps {
  application: JobApplication;
  index: number;
  onCardClick: (clickedApp: JobApplication) => void;
}

export const ApplicationCard = memo(({ application, index, onCardClick }: ApplicationCardProps) => (
  <Draggable draggableId={application._id} index={index}>
    {(provided, snapshot) => (
      <Paper
        className={cx(classes.card, { [classes.dragging]: snapshot.isDragging })}
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

        {/* Debugging section, comment out to see sorting indexes */}
        {/* <Text size="xs" c="blue">
          Debug: sortIndex={application.sortIndex}, index={index}
        </Text> */}
      </Paper>
    )}
  </Draggable>
));
