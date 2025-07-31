import { Task } from '@/types/task'

// 個別のタスクアイテムコンポーネント
function TaskItem({
  task,
  onUpdate,
  canEdit,
  loading,
  currentUserId,
}: {
  task: Task
  onUpdate: (taskId: string, isCompleted: boolean, comment: string) => void
  canEdit: boolean
  loading: boolean
  currentUserId?: string
}) {
  // 現在のユーザーの状態を取得
  const getUserStatus = () => {
    if (
      currentUserId &&
      task.childrenStatus &&
      task.childrenStatus[currentUserId]
    ) {
      return task.childrenStatus[currentUserId]
    }
    // デフォルト値
    return {
      isCompleted: false,
      comment: '',
    }
  }

  const userStatus = getUserStatus()

  return (
    <div className="bg-white p-2 rounded-lg border shadow-sm">
      <div className="flex items-start gap-3">
        <label className="flex items-center gap-2 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={userStatus.isCompleted}
            onChange={(e) =>
              onUpdate(task.id, e.target.checked, userStatus.comment)
            }
            disabled={!canEdit || loading}
            className="w-4 h-4"
          />
          <span
            className={`font-medium ${userStatus.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}
          >
            {task.title}
          </span>
        </label>
      </div>

      {canEdit && (
        <div className="mt-3">
          <textarea
            value={userStatus.comment || ''}
            onChange={(e) => {
              onUpdate(task.id, userStatus.isCompleted, e.target.value)
            }}
            placeholder="コメントを入力（任意）"
            disabled={loading}
            className="w-full border rounded p-2 text-sm resize-none h-10"
          />
        </div>
      )}

      {!canEdit && userStatus.comment && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
          コメント: {userStatus.comment}
        </div>
      )}
    </div>
  )
}

type Props = {
  todayTasks: Task[]
  updateTaskStatus: (
    taskId: string,
    isCompleted: boolean,
    comment: string
  ) => void
  updateAllTasks: () => void
  loading: boolean
  userInfo: { id: string; role: string } | null
}

export const ChildTaskList = ({
  todayTasks,
  updateTaskStatus,
  updateAllTasks,
  loading,
  userInfo,
}: Props) => (
  <div className="space-y-3">
    {todayTasks.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        onUpdate={updateTaskStatus}
        canEdit={userInfo?.role === 'child'}
        loading={loading}
        currentUserId={userInfo?.id}
      />
    ))}

    <button
      onClick={updateAllTasks}
      disabled={loading}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? '保存中...' : '保存する'}
    </button>
  </div>
)
