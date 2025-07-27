export default {
    type: 'object',
    properties: {
      driver: { type: 'string', format: 'mongoObjectId' },
      ride: { type: 'string', format: 'mongoObjectId' },
      points: { type: 'number' },
      date: { type: 'string', format: 'date-time' },
      type: { type: 'string' },
    },
    required: [
    ],
    additionalProperties: false,
  };