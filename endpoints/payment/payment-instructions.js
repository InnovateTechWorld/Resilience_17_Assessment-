const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const paymentInstructionsService = require('@app/services/payment/payment-instructions');

module.exports = createHandler({
  path: '/payment-instructions',
  method: 'post',
  middlewares: [],
  props: {
    unwrapResponse: true, // Don't wrap response in framework format
  },
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'payment-instructions-request-completed');
  },
  async handler(rc, helpers) {
  const payload = rc.body;

  const response = await paymentInstructionsService(payload);

  let httpStatus;
  if (response.status === 'failed') {
    httpStatus = helpers.http_statuses.HTTP_400_BAD_REQUEST;
  } else {
    httpStatus = helpers.http_statuses.HTTP_200_OK;
  }

  // Return the response data directly (unwrapped)
  return {
    status: httpStatus,
    data: response,
  };
  },
});