import React from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { jobApplicationApi } from 'resources/job-application';

import { handleApiError } from 'utils';

import { JobApplicationStatus, updateJobApplicationSchema } from 'schemas';
import { JobApplication, UpdateJobApplicationParams } from 'types';

import { JOB_APPLICATION_STATUS_OPTIONS } from '../constants/status';

interface UpdateJobApplicationModalProps {
  opened: boolean;
  onClose: () => void;
  application: JobApplication;
  onSuccess: (updatedApplication: JobApplication) => void;
}

const UpdateJobApplicationModal = ({ opened, onClose, application, onSuccess }: UpdateJobApplicationModalProps) => {
  const { mutate: updateApplication, isPending } = jobApplicationApi.useUpdate();
  const queryClient = useQueryClient();

  const {
    register,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateJobApplicationParams>({
    resolver: zodResolver(updateJobApplicationSchema),
    defaultValues: {
      company: application.company,
      position: application.position,
      status: application.status,
      salaryMin: application.salaryMin,
      salaryMax: application.salaryMax,
      notes: application.notes,
    },
  });

  const onSubmit = (data: UpdateJobApplicationParams) => {
    updateApplication(
      { id: application._id, data },
      {
        onSuccess: (updatedApplication) => {
          onSuccess(updatedApplication);
          onClose();
          queryClient.invalidateQueries({
            queryKey: ['job-applications'],
          });
        },
        onError: (e) => handleApiError(e, setError),
      },
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Изменить вакансию">
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
              defaultValue={application.salaryMin}
            />
            <NumberInput
              label="Максимальная зарплата"
              placeholder="До"
              error={errors.salaryMax?.message}
              onChange={(value) => setValue('salaryMax', typeof value === 'number' ? value : 0)}
              min={0}
              defaultValue={application.salaryMax}
            />
          </Group>

          <Select
            label="Статус"
            data={JOB_APPLICATION_STATUS_OPTIONS}
            defaultValue={application.status}
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
            Сохранить
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default UpdateJobApplicationModal;
