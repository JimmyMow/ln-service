const bodyParser = require('body-parser');
const compress = require('compression')();
const crypto = require('crypto');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const url = require('url');
const walnut = require('walnut');
const ws = require('ws');

const addressesRouter = require('./routers/addresses');
const balanceRouter = require('./routers/balance');
const blockchainRouter = require('./routers/blockchain');
const channelsRouter = require('./routers/channels');
const connectionsRouter = require('./routers/connections');
const lndGrpcInterface = require('./libs/lnd_grpc_interface');
const historyRouter = require('./routers/history');
const invoicesRouter = require('./routers/invoices');
const networkInfoRouter = require('./routers/network_info');
const payReqRouter = require('./routers/payment_request');
const peersRouter = require('./routers/peers');
const purchasedRouter = require('./routers/purchased');
const rowTypes = require('./config/row_types');
const subscribeToInvoices = require('./push/invoices');
const subscribeToTransactions = require('./push/transactions');
const transactionsRouter = require('./routers/transactions');
const walletInfoRouter = require('./routers/wallet_info');
const paymentsRouter = require('./routers/payments');

const lndGrpcHost = 'localhost:10009';
const logFormat = ':method :url :status - :response-time ms - :user-agent';
const port = process.env.PORT || 10553;

const app = express();
const lndGrpcApi = lndGrpcInterface('./config/grpc.proto', lndGrpcHost);

const server = http.createServer(app);
const wss = new ws.Server({server});

app
.listen(port, () => { console.log(`Listening on port: ${port}`); })
.on('error', (e) => { console.log('Listen error', e); });

app.disable('x-powered-by');

app.use(compress);
app.use(bodyParser.json());
app.use(logger(logFormat));

app.use('/v0/addresses', addressesRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/balance', balanceRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/blockchain', blockchainRouter({}));
app.use('/v0/channels', channelsRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/connections', connectionsRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/history', historyRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/invoices', invoicesRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/network_info', networkInfoRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/payment_request', payReqRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/payments', paymentsRouter({lnd_grpc_api: lndGrpcApi, wss}));
app.use('/v0/peers', peersRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/purchased', purchasedRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/transactions', transactionsRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/wallet_info', walletInfoRouter({lnd_grpc_api: lndGrpcApi}));
app.use('/v0/payments', paymentsRouter({lnd_grpc_api: lndGrpcApi}));

subscribeToInvoices({lnd_grpc_api: lndGrpcApi, wss});
subscribeToTransactions({lnd_grpc_api: lndGrpcApi, wss});

wss.on('connection', (ws) => {
  const location = url.parse(ws.upgradeReq.url, true);

  ws.on('message', (message) => { console.log('received: %s', message); });
});

server.listen(10554, () => {
  console.log('Listening on %d', server.address().port);
});

if (process.env.NODE_ENV !== 'production') {
  walnut.check(require('./package'));
}

