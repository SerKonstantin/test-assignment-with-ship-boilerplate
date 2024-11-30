import React from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

import { JobApplicationStatus } from 'schemas';
import { JobApplication } from 'types';

const STATUSES = {
  [JobApplicationStatus.APPLIED]: 'Отклик',
  [JobApplicationStatus.INTERVIEW]: 'Интервью',
  [JobApplicationStatus.OFFER]: 'Оффер',
  [JobApplicationStatus.REJECTED]: 'Отказ',
};

interface JobApplicationDetailModalProps {
  opened: boolean;
  onClose: () => void;
  application: JobApplication;
}

const LabelText = ({ children }: { children: React.ReactNode }) => (
  <Text fw={500} size="sm" w={120}>
    {children}
  </Text>
);

const JobApplicationDetailModal = ({ opened, onClose, application }: JobApplicationDetailModalProps) => (
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
        <Text>{STATUSES[application.status] || application.status}</Text>
      </Group>

      <Group align="flex-start">
        <LabelText>Заметки:</LabelText>
        <Text style={{ whiteSpace: 'pre-wrap', flex: 1 }}>{application.notes || 'Нет заметок'}</Text>
      </Group>

      <Group justify="flex-end" mt="xl">
        <Button variant="light" leftSection={<IconPencil size={16} />}>
          Изменить
        </Button>
        <Button color="red" variant="light" leftSection={<IconTrash size={16} />}>
          Удалить
        </Button>
      </Group>
    </Stack>
  </Modal>
);

export default JobApplicationDetailModal;
