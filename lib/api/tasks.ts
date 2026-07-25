import {
  createUserTaskAction,
  listUserTasksAction,
} from '@/lib/actions/tale-task-actions'
import { useUserStore } from '@/lib/stores/user-store'

export interface HistoryTask {
  task_id: string
  app_id: string
  user_id: string
  task_title: string
  task_input: Record<string, unknown>
  task_output: unknown
  task_type: string
  task_status: string
  created_at: string
  updated_at: string
}

export interface HistoryResponse {
  content: HistoryTask[]
  total: number
  pageable: {
    sort: { orders: unknown[] }
    pageNumber: number
    pageSize: number
  }
}

function requireCurrentUserId(): string {
  const userId = useUserStore.getState().user?.id
  if (!userId) {
    throw new Error('用户未登录或用户信息不完整')
  }
  return userId
}

export async function fetchHistoryTasks(
  taskStatus?: string
): Promise<HistoryResponse> {
  return listUserTasksAction(requireCurrentUserId(), taskStatus)
}

export async function fetchCarbonTradingTasks(): Promise<HistoryResponse> {
  return listUserTasksAction(requireCurrentUserId())
}

export async function saveTaskData(taskData: {
  task_title: string
  task_input: {
    content: string
  }
  task_output: Record<string, unknown>
  task_type: string
  task_status: string
}): Promise<{
  success: boolean
  data?: Record<string, unknown>
  error?: string
}> {
  try {
    const result = await createUserTaskAction(requireCurrentUserId(), taskData)
    return {
      success: true,
      data: result as unknown as Record<string, unknown>,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : '保存任务数据时发生错误',
    }
  }
}
