import { orderWorkflow } from './order'
import { sagaTravelWorkflow } from './saga-travel'

export const workflows: Record<string, any> = {
  'flux-enterprise-order': orderWorkflow,
  'saga-travel-reservation': sagaTravelWorkflow,
}
