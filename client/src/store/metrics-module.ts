import {
  createMetricsStoreModule,
  type MetricsStoreModule,
} from '@openlab/deconf-ui-toolkit'

export function metricsModule(): MetricsStoreModule {
  return {
    ...createMetricsStoreModule(),
    actions: {
      // ...
    },
  }
}
