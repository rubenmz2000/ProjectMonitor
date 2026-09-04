export interface TaskDetailData {
  id: string;
  taskNumber: number;
  taskIdentifier: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  creationDate: string;
  updatedAt: string;
  projectName: string;
  taskPrefix: string;
}
