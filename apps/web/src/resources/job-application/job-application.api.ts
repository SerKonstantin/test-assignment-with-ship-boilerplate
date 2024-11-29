import { useMutation, useQuery } from '@tanstack/react-query';

import { apiService } from 'services';

import queryClient from 'query-client';

import {
  ApiError,
  CreateJobApplicationParams,
  JobApplication,
  ListParams,
  ListResult,
  SortOrder,
  UpdateJobApplicationParams,
} from 'types';

export type JobApplicationsListFilterParams = {
  searchValue?: string;
};

export type JobApplicationsListSortParams = {
  sortIndex?: SortOrder;
};

export type JobApplicationsListParams = ListParams<JobApplicationsListFilterParams, JobApplicationsListSortParams>;

export const useList = (params: JobApplicationsListParams) =>
  useQuery<ListResult<JobApplication>>({
    queryKey: ['job-applications', params],
    queryFn: () => apiService.get('/job-applications', params),
  });

export const useCreate = () =>
  useMutation<JobApplication, ApiError, CreateJobApplicationParams>({
    mutationFn: (data: CreateJobApplicationParams) => apiService.post('/job-applications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });

export const useUpdate = () =>
  useMutation<JobApplication, ApiError, { id: string; data: UpdateJobApplicationParams }>({
    mutationFn: ({ id, data }) => apiService.patch(`/job-applications/${id}`, data),
  });

export const useDelete = () =>
  useMutation<JobApplication, ApiError, string>({
    mutationFn: (id: string) => apiService.delete(`/job-applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });
