/** Send a channel payment.

  {
    lnd_grpc_api: <Object>
    payment_request: <Serialized Payment Request String>
  }
*/
module.exports = (args, cbk) => {
  if (!args.lnd_grpc_api) {
    console.log('here??')
    return cbk([500, 'Missing lnd grpc api', args]);
  }

  const { dest_string, amt } = args
  return args.lnd_grpc_api.sendPaymentSync({
    dest_string,
    amt
  },
  (err, response) => {
    if (!!err) { return cbk(err, null); }
    return cbk(null, response)
  });
};

