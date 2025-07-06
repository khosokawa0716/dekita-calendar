// API層の統合エクスポート
export { taskTemplateAPI } from './taskTemplates'
export { taskAPI } from './tasks'
export { userAPI } from './users'
export { achievementAPI } from './achievements'

// 全てのAPIを一つのオブジェクトでエクスポート
import { taskTemplateAPI } from './taskTemplates'
import { taskAPI } from './tasks'
import { userAPI } from './users'
import { achievementAPI } from './achievements'

export const api = {
  taskTemplates: taskTemplateAPI,
  tasks: taskAPI,
  users: userAPI,
  achievements: achievementAPI,
}

export default api
