import React, { useState } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

import { jobApplicationApi } from 'resources/job-application';

import { handleApiError } from 'utils';

import { JobApplication } from 'types';

import { JOB_APPLICATION_STATUS_LABELS } from '../constants/status';
import DeleteJobApplicationModal from './delete-job-application-modal';

interface JobApplicationDetailModalProps {
  opened: boolean;
  onClose: () => void;
  application: JobApplication;
  onUpdate: () => void;
}

const LabelText = ({ children }: { children: React.ReactNode }) => (
  <Text fw={500} size="sm" w={120}>
    {children}
  </Text>
);

const JobApplicationDetailModal = ({ opened, onClose, application, onUpdate }: JobApplicationDetailModalProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate: deleteApplication, isPending: isDeleting } = jobApplicationApi.useDelete();

  const handleDelete = () => {
    deleteApplication(application._id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        onClose();
      },
      onError: (e) => handleApiError(e),
    });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={application.position}
        size="lg"
        styles={{ title: { fontSize: '2rem', fontWeight: 600 } }}
      >
        <Stack gap="md">
          <Group>
            <LabelText>Компания:</LabelText>
            <Text>{application.company}</Text>
          </Group>

          <Group>
            <LabelText>Зарплата:</LabelText>
            <Text>
              ${application.salaryMin} - ${application.salaryMax}
            </Text>
          </Group>

          <Group>
            <LabelText>Статус:</LabelText>
            <Text>{JOB_APPLICATION_STATUS_LABELS[application.status]}</Text>
          </Group>

          <Group align="flex-start">
            <LabelText>Заметки:</LabelText>
            <Text style={{ whiteSpace: 'pre-wrap', flex: 1, overflowWrap: 'anywhere' }}>
              {application.notes || 'Нет заметок'}
            </Text>
          </Group>

          <Group justify="flex-end" mt="xl">
            <Button variant="light" leftSection={<IconPencil size={16} />} onClick={onUpdate}>
              Изменить
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>

      <DeleteJobApplicationModal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
};

export default JobApplicationDetailModal;
