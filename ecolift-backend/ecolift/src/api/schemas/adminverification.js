export default {
    type: 'object',
    properties: {
      driver: { type: 'string', format: 'mongoObjectId' },
      status: { type: 'string' },
      submittedAt: { type: 'string', format: 'date-time' },
      verifiedAt: { type: 'string', format: 'date-time' },
    },
    required: [
    ],
    additionalProperties: false,
  };