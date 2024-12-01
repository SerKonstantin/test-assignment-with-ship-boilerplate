import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { ActionIcon, Button, Group, SimpleGrid, Skeleton, Stack, TextInput, Title } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import { DragDropContext } from '@hello-pangea/dnd';
import { IconSearch, IconX } from '@tabler/icons-react';

import { jobApplicationApi, JobApplicationsListParams } from 'resources/job-application';

import { JobApplicationStatus } from 'schemas';
import { JobApplication } from 'types';

import { JOB_APPLICATION_STATUS_LABELS } from './constants/status';
import { useDrag } from './scripts/use-drag';
import {
  ApplicationColumn,
  CreateJobApplicationModal,
  JobApplicationDetailModal,
  UpdateJobApplicationModal,
} from './components';

const COLUMN_DEFINITIONS = Object.entries(JOB_APPLICATION_STATUS_LABELS).map(([status, title]) => ({
  status: status as JobApplicationStatus,
  title,
}));

const JobApplications: NextPage = () => {
  const [params, setParams] = useSetState<JobApplicationsListParams>({
    searchValue: '',
    sort: { sortIndex: 'asc' },
  });
  const handleSearch = (value: string) => {
    setParams({ searchValue: value });
  };

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [openedCreate, setOpenedCreate] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [openedUpdate, setOpenedUpdate] = useState(false);
  const { data: applications, isLoading } = jobApplicationApi.useList(params);

  const columnData = COLUMN_DEFINITIONS.map(({ status, title }) => ({
    status,
    title,
    applications: (applications?.results?.filter((app) => app.status === status) || []).sort(
      (a, b) => a.sortIndex - b.sortIndex,
    ),
  }));

  const { handleDragEnd, handleDragUpdate } = useDrag({ params, columnData });

  if (isLoading) {
    return (
      <Stack gap="md">
        {Array.from(Array(columnData.length), (i) => (
          <Skeleton key={i} h={60} radius="sm" />
        ))}
      </Stack>
    );
  }

  return (
    <>
      <Head>
        <title>Вакансии</title>
      </Head>

      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Вакансии</Title>
          <Group>
            <TextInput
              w={350}
              placeholder="Искать"
              value={params.searchValue}
              onChange={(event) => handleSearch(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              rightSection={
                params.searchValue && (
                  <ActionIcon variant="transparent" onClick={() => handleSearch('')}>
                    <IconX color="gray" stroke={1.5} />
                  </ActionIcon>
                )
              }
            />
            <Button onClick={() => setOpenedCreate(true)}>Добавить отклик</Button>
            <Button variant="light" color="red">
              Удалить все отказы
            </Button>
          </Group>
        </Group>

        <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
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
        <>
          <JobApplicationDetailModal
            opened={openedDetail && !openedUpdate}
            onClose={() => {
              setOpenedDetail(false);
              setSelectedApplication(null);
            }}
            application={selectedApplication}
            onUpdate={() => setOpenedUpdate(true)}
          />
          <UpdateJobApplicationModal
            opened={openedUpdate}
            onClose={() => setOpenedUpdate(false)}
            application={selectedApplication}
            onSuccess={(updatedApplication) => {
              setSelectedApplication(updatedApplication);
              setOpenedUpdate(false);
              setOpenedDetail(true);
            }}
          />
        </>
      )}
    </>
  );
};

export default JobApplications;
