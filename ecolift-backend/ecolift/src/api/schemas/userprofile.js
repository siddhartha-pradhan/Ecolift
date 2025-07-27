export default {
    type: 'object',
    properties: {
      user: { type: 'string', format: 'mongoObjectId' },
      isPremium: { type: 'boolean' },
      premiumExpiryDate: { type: 'string', format: 'date-time' },
      freeRidesRemaining: { type: 'integer' },
      redeemPoints: { type: 'number' },
    },
    required: [
      'user',
      'isPremium',
      'premiumExpiryDate',
      'freeRidesRemaining',
      'redeemPoints',
    ],
    additionalProperties: false,
  };