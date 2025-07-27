export default {
    type: 'object',
    properties: {
      user: { type: 'string', format: 'mongoObjectId' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      paymentStatus: { type: 'string' },
      paymentAmount: { type: 'number' },
    },
    required: [
      'startDate',
      'endDate',
      'paymentStatus',
      'paymentAmount',
    ],
    additionalProperties: false,
  };