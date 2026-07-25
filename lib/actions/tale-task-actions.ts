'use server'

import type { UserTask } from '@turinhub/tale-js-sdk'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

function toLegacyTask(task: UserTask) {
  return {
    task_id: task.taskId,
    app_id: task.appId,
    user_id: task.userId,
    task_title: task.taskTitle,
    task_input: task.taskInput,
    task_output: task.taskOutput,
    task_type: task.taskType,
    task_status: task.taskStatus,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  }
}

export async function listUserTasksAction(
  userId: string,
  taskStatus?: string
) {
  const result = await createTaleServerAppClient().tasks.list({
    page: 0,
    size: 10,
    sort: 'createdAt,desc',
    userIds: userId,
    taskStatus: taskStatus || undefined,
  })

  return {
    total: result.total,
    content: result.content.map(toLegacyTask),
    pageable: {
      sort: { orders: result.sort },
      pageNumber: result.page,
      pageSize: result.size,
    },
  }
}

export async function createUserTaskAction(
  userId: string,
  taskData: {
    task_title: string
    task_input: Record<string, unknown>
    task_output: Record<string, unknown>
    task_type: string
    task_status: string
  }
) {
  const result = await createTaleServerAppClient().tasks.create({
    userId,
    taskTitle: taskData.task_title,
    taskInput: taskData.task_input,
    taskOutput: taskData.task_output,
    taskType: taskData.task_type,
    taskStatus: taskData.task_status,
  })
  return toLegacyTask(result)
}
