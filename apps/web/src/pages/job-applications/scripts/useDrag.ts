import { DragUpdate, DropResult } from '@hello-pangea/dnd';

import { jobApplicationApi } from 'resources/job-application';

import { handleApiError } from 'utils';

import queryClient from 'query-client';

import { JobApplicationStatus } from 'schemas';
import { JobApplication, ListResult } from 'types';

import { calculateSortIndexOnDrag } from './calculate-sort-index-on-drag';

interface UseDragProps {
  params: jobApplicationApi.JobApplicationsListParams;
  columnData: {
    status: JobApplicationStatus;
    title: string;
    applications: JobApplication[];
  }[];
}

export const useDrag = ({ params, columnData }: UseDragProps) => {
  const { mutate: updateApplication } = jobApplicationApi.useUpdate();

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

  const handleDragUpdate = (update: DragUpdate) => {
    if (!update.destination) return;

    const { draggableId, destination } = update;
    const destinationColumn = columnData.find((col) => col.status === destination.droppableId);

    if (!destinationColumn) return;

    const newSortIndex = calculateSortIndexOnDrag(destinationColumn, destination, draggableId);

    queryClient.setQueryData(['job-applications', params], (old: ListResult<JobApplication>) => ({
      ...old,
      results: old.results.map((app) =>
        app._id === draggableId
          ? {
              ...app,
              status: destination.droppableId as JobApplicationStatus,
              sortIndex: newSortIndex,
            }
          : app,
      ),
    }));
  };

  return {
    handleDragEnd,
    handleDragUpdate,
  };
};
