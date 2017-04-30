const ExpressRouter = require('express').Router;

const returnJson = require('./../libs/return_json');
const sendPayment = require('./../libs/send_payment');

/** Get a payments router.

  {
    lnd_grpc_api: <LND API>
    wss: <Websocket Server>
  }

  @returns
  <Router Object>
*/
module.exports = (args) => {
  if (!args.lnd_grpc_api) {
    return (req, res) => { return res.status(500).send(); };
  }

  const router = ExpressRouter({caseSensitive: true, strict: true});

  router.post('/', (req, res, next) => {
    const { dest_string, amt } = req.body
    const { lnd_grpc_api, wss } = args

    return sendPayment({
      lnd_grpc_api,
      dest_string,
      amt,
      wss
    }, (error, response) => {
      console.log('ERROR: ', error)
      if (error) { return res.status(500).send({ error }) }

      return res.json(response)
    })
  })

  return router;
};

