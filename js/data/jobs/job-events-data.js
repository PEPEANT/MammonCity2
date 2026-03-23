const JOB_EVENTS = {
  ...SERVICE_JOB_EVENTS,
  ...LABOR_JOB_EVENTS,
  ...ADVANCED_JOB_EVENTS,
  "delivery-motorbike": SERVICE_JOB_EVENTS.delivery,
  "delivery-courier": SERVICE_JOB_EVENTS.delivery,
};
