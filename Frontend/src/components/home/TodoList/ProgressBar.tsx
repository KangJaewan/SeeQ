/**
 * Todo 진행률 바
 */
interface ProgressBarProps {
  percentage: number
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="todo-progress mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="progress-label text-sm text-gray-600 dark:text-gray-400">
          진행률
        </span>
        <span className="progress-percentage text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {percentage}%
        </span>
      </div>
      <div className="progress-bar w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="progress-fill h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
