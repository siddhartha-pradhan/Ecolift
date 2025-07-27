export default {
    type: 'object',
    properties: {
      user: { type: 'string', format: 'mongoObjectId' },
      vehicleDetails: { type: 'string' },
      licenseImage: { type: 'string' },
      bluebookImage: { type: 'string' },
      isVerified: { type: 'boolean', default:false },
    },
    required: [
      'user',
      'vehicleDetails',
      'isVerified',
    ],
    additionalProperties: false,
  };