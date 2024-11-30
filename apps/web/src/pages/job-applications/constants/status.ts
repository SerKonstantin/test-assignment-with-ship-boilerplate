import { JobApplicationStatus } from 'schemas';

export const JOB_APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.APPLIED]: 'Отклик',
  [JobApplicationStatus.INTERVIEW]: 'Интервью',
  [JobApplicationStatus.OFFER]: 'Оффер',
  [JobApplicationStatus.REJECTED]: 'Отказ',
};

export const JOB_APPLICATION_STATUS_OPTIONS = Object.entries(JOB_APPLICATION_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));
