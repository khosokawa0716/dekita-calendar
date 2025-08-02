import Link from 'next/link'
import { Task } from '@/types/task'

type Props = {
  tasks: Task[]
  childrenData: {
    id: string
    displayName: string
  }[]
  toggleCompleted: (task: Task, childId: string) => void
}

export const ParentTaskList = ({
  tasks,
  childrenData,
  toggleCompleted,
}: Props) => {
  const getChildName = (childId: string) => {
    const child = childrenData.find((c) => c.id === childId)
    return child ? child.displayName : 'Unknown'
  }

  const getTaskCompletionStatus = (task: Task) => {
    const completed = Object.values(task.childrenStatus).filter(
      (status) => status.isCompleted
    ).length
    const total = Object.keys(task.childrenStatus).length
    return { completed, total }
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const { completed, total } = getTaskCompletionStatus(task)
        return (
          <div
            key={task.id}
            className="bg-white p-4 rounded-lg border shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  完了状況: {completed}/{total} 人
                </p>
                {/* 子どもごとの詳細状況 */}
                {task.childrenStatus &&
                  Object.keys(task.childrenStatus).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(task.childrenStatus).map(
                        ([childId, status]) => (
                          <div
                            key={childId}
                            className="flex items-center space-x-2 text-sm cursor-pointer"
                            onClick={() => toggleCompleted(task, childId)}
                          >
                            <span
                              className={`w-4 h-4 rounded-full ${status.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
                            ></span>
                            <span>{getChildName(childId)}</span>
                            {status.isCompleted && (
                              <span className="text-green-600">✓ 完了</span>
                            )}
                            {status.comment && (
                              <span className="text-gray-500">
                                - {status.comment}
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
              <Link
                href={`/tasks/edit/${task.id}`}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                編集する
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
