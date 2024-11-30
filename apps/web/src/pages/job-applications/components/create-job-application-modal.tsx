import React from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { jobApplicationApi } from 'resources/job-application';

import { handleApiError } from 'utils';

import { createJobApplicationSchema, JobApplicationStatus } from 'schemas';
import { CreateJobApplicationParams } from 'types';

interface CreateJobApplicationModalProps {
  opened: boolean;
  onClose: () => void;
}

const CreateJobApplicationModal = ({ opened, onClose }: CreateJobApplicationModalProps) => {
  const { mutate: createApplication, isPending } = jobApplicationApi.useCreate();

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateJobApplicationParams>({
    resolver: zodResolver(createJobApplicationSchema),
    defaultValues: {
      status: JobApplicationStatus.APPLIED,
      salaryMin: 0,
      salaryMax: 0,
    },
  });

  const onSubmit = (data: CreateJobApplicationParams) => {
    createApplication(data, {
      onSuccess: () => {
        onClose();
        reset();
      },
      onError: (e) => handleApiError(e, setError),
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Добавить вакансию">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Компания"
            placeholder="Введите название компании"
            error={errors.company?.message}
            {...register('company')}
          />

          <TextInput
            label="Должность"
            placeholder="Введите должность"
            error={errors.position?.message}
            {...register('position')}
          />

          <Group grow>
            <NumberInput
              label="Минимальная зарплата"
              placeholder="От"
              error={errors.salaryMin?.message}
              onChange={(value) => setValue('salaryMin', typeof value === 'number' ? value : 0)}
              min={0}
            />
            <NumberInput
              label="Максимальная зарплата"
              placeholder="До"
              error={errors.salaryMax?.message}
              onChange={(value) => setValue('salaryMax', typeof value === 'number' ? value : 0)}
              min={0}
            />
          </Group>

          <Select
            label="Статус"
            data={[
              { value: JobApplicationStatus.APPLIED, label: 'Отклик' },
              { value: JobApplicationStatus.INTERVIEW, label: 'Интервью' },
              { value: JobApplicationStatus.OFFER, label: 'Оффер' },
              { value: JobApplicationStatus.REJECTED, label: 'Отказ' },
            ]}
            defaultValue={JobApplicationStatus.APPLIED}
            onChange={(value) => value && setValue('status', value as JobApplicationStatus)}
            error={errors.status?.message}
          />

          <Textarea
            label="Заметка"
            placeholder="Любая дополнительная информация"
            error={errors.notes?.message}
            {...register('notes')}
          />

          <Button type="submit" loading={isPending} fullWidth mt="md">
            Добавить
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateJobApplicationModal;
