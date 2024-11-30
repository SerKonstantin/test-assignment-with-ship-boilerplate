import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Button, Group, SimpleGrid, Skeleton, Stack, Title } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

import { jobApplicationApi, JobApplicationsListParams } from 'resources/job-application';

import { handleApiError } from 'utils';

import queryClient from 'query-client';

import { JobApplicationStatus } from 'schemas';
import { JobApplication, ListResult } from 'types';

import { ApplicationColumn } from './components/application-column';
import CreateJobApplicationModal from './components/create-job-application-modal';
import JobApplicationDetailModal from './components/job-application-detail-modal';
import { JOB_APPLICATION_STATUS_LABELS } from './constants/status';
import { calculateSortIndexOnDrag } from './utils/calculate-sort-index-on-drag';

const COLUMN_DEFINITIONS = Object.entries(JOB_APPLICATION_STATUS_LABELS).map(([status, title]) => ({
  status: status as JobApplicationStatus,
  title,
}));

const JobApplications: NextPage = () => {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  // TODO: temporary disable linter here, we will need to set params for search/filter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [params, setParams] = useSetState<JobApplicationsListParams>({
    searchValue: '',
    sort: { sortIndex: 'asc' },
  });
  const [openedCreate, setOpenedCreate] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);

  // Get/Update applications from server
  const { data: applications, isLoading } = jobApplicationApi.useList(params);
  const { mutate: updateApplication } = jobApplicationApi.useUpdate();

  // Filter applications to columns by status
  const columnData = COLUMN_DEFINITIONS.map(({ status, title }) => ({
    status,
    title,
    applications: (applications?.results?.filter((app) => app.status === status) || []).sort(
      (a, b) => a.sortIndex - b.sortIndex,
    ),
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const sourceColumn = columnData.find((col) => col.status === source.droppableId);
    const destinationColumn = columnData.find((col) => col.status === destination.droppableId);

    if (!sourceColumn || !destinationColumn) return;

    // Save the current data for potential rollback
    const previousData = queryClient.getQueryData(['job-applications', params]);

    const newSortIndex = calculateSortIndexOnDrag(destinationColumn, destination, draggableId);
    const updatedApplication = {
      status: destination.droppableId as JobApplicationStatus,
      sortIndex: newSortIndex,
    };

    // Update the cache locally and wait if server response is ok
    queryClient.setQueryData(['job-applications', params], (old: ListResult<JobApplication>) => ({
      ...old,
      results: old.results.map((app) => (app._id === draggableId ? { ...app, ...updatedApplication } : app)),
    }));

    updateApplication(
      { id: draggableId, data: updatedApplication },
      {
        onError: (error) => {
          // Rollback to saved data
          queryClient.setQueryData(['job-applications', params], previousData);
          handleApiError(error);
        },
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
            <Button onClick={() => setOpenedCreate(true)}>Добавить отклик</Button>
            <Button variant="light" color="red">
              Удалить все отказы
            </Button>
          </Group>
        </Group>

        <DragDropContext onDragEnd={handleDragEnd}>
          <SimpleGrid cols={4}>
            {columnData.map(({ status, title, applications: columnApps }) => (
              <ApplicationColumn
                key={status}
                status={status}
                title={title}
                applications={columnApps}
                onCardClick={(clickedApp) => {
                  setSelectedApplication(clickedApp);
                  setOpenedDetail(true);
                }}
              />
            ))}
          </SimpleGrid>
        </DragDropContext>
      </Stack>

      <CreateJobApplicationModal opened={openedCreate} onClose={() => setOpenedCreate(false)} />
      {selectedApplication && (
        <JobApplicationDetailModal
          opened={openedDetail}
          onClose={() => {
            setOpenedDetail(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
        />
      )}
    </>
  );
};

export default JobApplications;
