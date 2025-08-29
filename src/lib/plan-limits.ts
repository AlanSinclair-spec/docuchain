export const PLAN_LIMITS = {
  free: {
    vendors: 3,
    documents: 25,
    apiCalls: 0,
    storage: '100MB',
  },
  foundation: {
    vendors: 20,
    documents: 200,
    apiCalls: 100,
    storage: '1GB',
  },
  professional: {
    vendors: null, // unlimited
    documents: null, // unlimited
    apiCalls: 1000,
    storage: '10GB',
  },
  enterprise: {
    vendors: null,
    documents: null,
    apiCalls: null,
    storage: 'unlimited',
  },
} as const

export type PlanLimits = typeof PLAN_LIMITS
export type PlanName = keyof PlanLimits

export function getPlanLimits(plan: PlanName) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export function canCreateVendor(plan: PlanName, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return limits.vendors === null || currentCount < limits.vendors
}

export function canUploadDocument(plan: PlanName, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return limits.documents === null || currentCount < limits.documents
}

export function canMakeApiCall(plan: PlanName, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return limits.apiCalls === null || currentCount < limits.apiCalls
}
