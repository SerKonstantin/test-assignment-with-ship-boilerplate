import React from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface DeleteJobApplicationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteJobApplicationModal = ({ opened, onClose, onConfirm, isLoading }: DeleteJobApplicationModalProps) => (
  <Modal opened={opened} onClose={onClose} title="Подтвердите удаление" size="sm" centered>
    <Stack>
      <Text>Вы уверены, что хотите удалить этот отклик?</Text>

      <Group justify="flex-end" mt="xl">
        <Button color="red" onClick={onConfirm} loading={isLoading}>
          Удалить
        </Button>
        <Button variant="light" onClick={onClose} disabled={isLoading}>
          Отмена
        </Button>
      </Group>
    </Stack>
  </Modal>
);

export default DeleteJobApplicationModal;
