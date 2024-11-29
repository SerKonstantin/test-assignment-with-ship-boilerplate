import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import { DragDropContext, Draggable, DragUpdate, Droppable, DropResult } from '@hello-pangea/dnd';

import { jobApplicationApi, JobApplicationsListParams } from 'resources/job-application';

import { handleApiError } from 'utils';

import queryClient from 'query-client';

import { JobApplicationStatus } from 'schemas';
import { JobApplication, ListResult } from 'types';

import CreateJobApplicationModal from './components/create-job-application-modal';

const COLUMN_DEFINITIONS = [
  { status: JobApplicationStatus.APPLIED, title: 'Отклик' },
  { status: JobApplicationStatus.INTERVIEW, title: 'Интервью' },
  { status: JobApplicationStatus.OFFER, title: 'Оффер' },
  { status: JobApplicationStatus.REJECTED, title: 'Отказ' },
];

const ApplicationCard = ({ application, index }: { application: JobApplication; index: number }) => (
  <Draggable draggableId={application._id} index={index}>
    {(dragProvided) => (
      <Paper
        p="sm"
        withBorder
        mb="sm"
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        {...dragProvided.dragHandleProps}
      >
        <Text fw={500}>{application.company}</Text>
        <Text size="sm">{application.position}</Text>
        <Text size="xs" c="dimmed">
          ${application.salaryMin} - ${application.salaryMax}
        </Text>
      </Paper>
    )}
  </Draggable>
);

const ApplicationColumn = ({
  status,
  title,
  applications,
}: {
  status: JobApplicationStatus;
  title: string;
  applications: JobApplication[];
}) => (
  <Droppable droppableId={status}>
    {(provided) => (
      <Paper p="md" withBorder ref={provided.innerRef} {...provided.droppableProps}>
        <Group justify="space-between" mb="md">
          <Title order={4}>{title}</Title>
        </Group>
        {applications.map((application, index) => (
          <ApplicationCard key={application._id} application={application} index={index} />
        ))}
        {provided.placeholder}
      </Paper>
    )}
  </Droppable>
);

const calculateNewSortIndex = (
  destinationColumn: { applications: JobApplication[] },
  destination: { index: number },
) => {
  if (destinationColumn.applications.length === 0) {
    return 1000;
  }
  if (destination.index === 0) {
    return destinationColumn.applications[0].sortIndex - 1000;
  }
  if (destination.index >= destinationColumn.applications.length) {
    return destinationColumn.applications[destinationColumn.applications.length - 1].sortIndex + 1000;
  }
  return (
    (destinationColumn.applications[destination.index - 1].sortIndex +
      destinationColumn.applications[destination.index].sortIndex) /
    2
  );
};

const JobApplications: NextPage = () => {
  // TODO: temporary disable linter here, we will need to set params for search/filter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [params, setParams] = useSetState<JobApplicationsListParams>({
    searchValue: '',
    sort: { sortIndex: 'asc' },
  });

  const { data: applications, isLoading } = jobApplicationApi.useList(params);
  const { mutate: updateApplication } = jobApplicationApi.useUpdate();

  const [opened, setOpened] = useState(false);

  // Filter applications to columns by status
  const columnData = COLUMN_DEFINITIONS.map(({ status, title }) => ({
    status,
    title,
    applications: applications?.results?.filter((app) => app.status === status) || [],
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const sourceColumn = columnData.find((col) => col.status === source.droppableId);
    const destinationColumn = columnData.find((col) => col.status === destination.droppableId);

    if (!sourceColumn || !destinationColumn) return;

    // Get the current data for potential rollback
    const previousData = queryClient.getQueryData(['job-applications', params]);

    const newSortIndex = calculateNewSortIndex(destinationColumn, destination);
    const updatedApplication = {
      status: destination.droppableId as JobApplicationStatus,
      sortIndex: newSortIndex,
    };

    updateApplication(
      {
        id: draggableId,
        data: updatedApplication,
      },
      {
        onError: (error) => {
          // Rollback to saved data
          queryClient.setQueryData(['job-applications', params], previousData);
          handleApiError(error);
        },
      },
    );
  };

  const onDragUpdate = (update: DragUpdate) => {
    if (!update.destination) return;

    const { draggableId } = update;

    // Update the position immediately during drag
    queryClient.setQueryData(['job-applications', params], (old: ListResult<JobApplication>) => ({
      ...old,
      results: old.results.map((app: JobApplication) =>
        app._id === draggableId ? { ...app, status: update.destination?.droppableId as JobApplicationStatus } : app,
      ),
    }));
  };

  if (isLoading) {
    return (
      <Stack gap="md">
        {Array.from(Array(columnData.length), (i) => (
          <Skeleton key={i} h={60} radius="sm" /> // TODO: add props ?
        ))}
      </Stack>
    );
  }

  return (
    <>
      <Head>
        <title>Job Applications</title>
      </Head>

      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Job Applications</Title>
          <Group>
            <Button onClick={() => setOpened(true)}>Добавить отклик</Button>
            <Button variant="light" color="red">
              Удалить все отказы
            </Button>
          </Group>
        </Group>

        <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={onDragUpdate}>
          <SimpleGrid cols={4}>
            {columnData.map(({ status, title, applications: columnApplications }) => (
              <ApplicationColumn key={status} status={status} title={title} applications={columnApplications} />
            ))}
          </SimpleGrid>
        </DragDropContext>
      </Stack>

      <CreateJobApplicationModal opened={opened} onClose={() => setOpened(false)} />
    </>
  );
};

export default JobApplications;
