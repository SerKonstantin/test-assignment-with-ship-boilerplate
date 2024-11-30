import { JobApplication } from 'types';

export const calculateSortIndexOnDrag = (
  destinationColumn: { applications: JobApplication[] },
  destination: { index: number },
  draggableId: string,
) => {
  const applications = destinationColumn.applications.filter((app) => app._id !== draggableId);

  if (applications.length === 0) {
    return 1000;
  }

  if (destination.index === 0) {
    return applications[0].sortIndex - 1000;
  }

  if (destination.index >= applications.length) {
    return applications[applications.length - 1].sortIndex + 1000;
  }

  const prevCard = applications[destination.index - 1];
  const nextCard = applications[destination.index];
  return prevCard.sortIndex + (nextCard.sortIndex - prevCard.sortIndex) / 2;
};
