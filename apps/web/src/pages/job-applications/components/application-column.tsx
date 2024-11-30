import React, { memo } from 'react';
import { Group, Paper, Title } from '@mantine/core';
import { Droppable } from '@hello-pangea/dnd';

import { JobApplicationStatus } from 'schemas';
import { JobApplication } from 'types';

import { ApplicationCard } from './application-card';

export const ApplicationColumn = memo(
  ({
    status,
    title,
    applications: columnApplications,
    onCardClick,
  }: {
    status: JobApplicationStatus;
    title: string;
    applications: JobApplication[];
    onCardClick: (clickedApp: JobApplication) => void;
  }) => (
    <Droppable droppableId={status}>
      {(provided) => (
        <Paper p="md" withBorder ref={provided.innerRef} {...provided.droppableProps}>
          <Group justify="space-between" mb="md">
            <Title order={4}>{title}</Title>
          </Group>
          {columnApplications.map((application, index) => (
            <ApplicationCard key={application._id} application={application} index={index} onCardClick={onCardClick} />
          ))}
          {provided.placeholder}
        </Paper>
      )}
    </Droppable>
  ),
);
