export default {
    type: 'object',
    properties: {
        name: { type: 'string', maxLength: 100 },
        price: { type: 'number', minimum: 0 }
    },
    required: ['name', 'price'],
    additionalProperties: false,
};
