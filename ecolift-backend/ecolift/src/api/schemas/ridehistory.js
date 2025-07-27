export default {
    type: 'object',
    properties: {
      ride: { type: 'string', format: 'mongoObjectId' },
      user: { type: 'string', format: 'mongoObjectId' },
      dateTaken: { type: 'string', format: 'date-time' },
      redeemPointsEarned: { type: 'number' },
      driver: { type: 'string', format: 'mongoObjectId' },
    },
    required: [
      'ride',
      'user',
      'dateTaken',
      'redeemPointsEarned',
      'driver',
    ],
    additionalProperties: false,
  };