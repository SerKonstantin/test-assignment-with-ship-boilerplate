import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import { jobApplicationApi, JobApplicationsListParams } from 'resources/job-application';

import { handleApiError } from 'utils';

import queryClient from 'query-client';

import { JobApplicationStatus } from 'schemas';
import { ApiError } from 'types';

import CreateJobApplicationModal from './components/create-job-application-modal';

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

  const columnData = [
    {
      status: JobApplicationStatus.APPLIED,
      title: 'Отклик',
      applications: applications?.results?.filter((app) => app.status === JobApplicationStatus.APPLIED) || [],
    },
    {
      status: JobApplicationStatus.INTERVIEW,
      title: 'Интервью',
      applications: applications?.results?.filter((app) => app.status === JobApplicationStatus.INTERVIEW) || [],
    },
    {
      status: JobApplicationStatus.OFFER,
      title: 'Оффер',
      applications: applications?.results?.filter((app) => app.status === JobApplicationStatus.OFFER) || [],
    },
    {
      status: JobApplicationStatus.REJECTED,
      title: 'Отказ',
      applications: applications?.results?.filter((app) => app.status === JobApplicationStatus.REJECTED) || [],
    },
  ];

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    const sourceColumn = columnData.find((col) => col.status === source.droppableId);
    const destinationColumn = columnData.find((col) => col.status === destination.droppableId);

    if (!sourceColumn || !destinationColumn) return;

    let newSortIndex;
    if (destinationColumn.applications.length === 0) {
      newSortIndex = 1000;
    } else if (destination.index === 0) {
      newSortIndex = destinationColumn.applications[0].sortIndex - 1000;
    } else if (destination.index >= destinationColumn.applications.length) {
      newSortIndex = destinationColumn.applications[destinationColumn.applications.length - 1].sortIndex + 1000;
    } else {
      newSortIndex =
        (destinationColumn.applications[destination.index - 1].sortIndex +
          destinationColumn.applications[destination.index].sortIndex) /
        2;
    }

    updateApplication(
      {
        id: draggableId,
        data: {
          status: destination.droppableId as JobApplicationStatus,
          sortIndex: newSortIndex,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['job-applications'] });
        },
        onError: (error: ApiError) => handleApiError(error),
      },
    );
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

        <DragDropContext onDragEnd={handleDragEnd}>
          <SimpleGrid cols={4}>
            {columnData.map(({ status, title, applications: columnApplications }) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <Paper p="md" withBorder ref={provided.innerRef} {...provided.droppableProps}>
                    <Group justify="space-between" mb="md">
                      <Title order={4}>{title}</Title>
                    </Group>

                    {columnApplications.map((application, index) => (
                      <Draggable key={application._id} draggableId={application._id} index={index}>
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
                    ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </SimpleGrid>
        </DragDropContext>
      </Stack>

      <CreateJobApplicationModal opened={opened} onClose={() => setOpened(false)} />
    </>
  );
};

export default JobApplications;
