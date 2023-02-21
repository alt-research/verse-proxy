# Verse-Proxy
This is proxy to control access allow list to verse layer.  
Verse-Proxy is made by [Nest](https://github.com/nestjs/nest).  

Verse-Proxy can control following items.  
- jsonrpc method
- transaction's from, to, value
- address which can deploy smart contract


## Verse Proxy Build Steps

### 1. Git clone
```bash
git clone git@github.com:oasysgames/verse-proxy.git
```

### 2. Set access allow list
Set access allow list at following file.  
Details are described later.
- `src/config/configuration.ts`
- `src/config/transactionAllowList.ts`

### 3. Set up npm
```bash
$ npm install
$ npm build
```

### 4. Run app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Deploy
#### 1. Set PORT
```bash
export PORT=[YOUR_PROXY_PORT]
```

#### 2. Set allow list config
You have to download your allow list config to `$PWD/src/config`.

#### 3. Start container
```bash
# chose image version and pull image
docker pull ghcr.io/oasysgames/verse-proxy:v1.0.0

# create container
docker run --name verse-proxy -d -p $PORT:$PORT -v $PWD/src/config:/usr/src/app/src/config verse-proxy
```

## Control items

### Set allowed verse request methods
You can set allowed verse request methods by regex at `src/config/configuration.ts`.
```typescript
allowedMethods: [
  /^net_version$/,
  /^web3_clientVersion$/,
  /^eth_get.*$/,
  /^eth_sendRawTransaction$/,
  /^eth_chainId$/,
  /^eth_blockNumber$/,
  /^eth_call$/,
  /^eth_estimateGas$/,
  /^eth_gasPrice$/,
  /^eth_maxPriorityFeePerGas$/,
  /^eth_feeHistory$/,
  /^eth_.*Filter$/,
],
```

Default allowedMethods feature are following.  
- It allows methods that may be requested by users
- It prohibits the methods of executing a transaction with the authority of verse-geth(e.g. eth_sendTransaction)

### Set transaction allow list
You can set allowed transaction list at `src/config/transactionAllowList.ts`.

#### from, to
You can control the from and to of a transaction.

You can set either the allowed_address_list or the denied_address_list.

| Key  |  Description  |
| ---- | ---- |
|  allowList  |  Only the address specified here is allowed.  |
|  deniedList  |  Addresses other than the one specified here are permitted.  |

```typescript
// you can set multiple restriction setting
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    // 0xaf395754eB6F542742784cE7702940C60465A46a can transact to 0xaf395754eB6F542742784cE7702940C60465A46b
    {
      fromList: { allowList: ['0xaf395754eB6F542742784cE7702940C60465A46a'] },
      toList: { allowList: ['0xaf395754eB6F542742784cE7702940C60465A46b'] },
    },
    // 0xaf395754eB6F542742784cE7702940C60465A46c cannot transact to 0xaf395754eB6F542742784cE7702940C60465A46d
    {
      fromList: { allowList: ['0xaf395754eB6F542742784cE7702940C60465A46c'] },
      toList: { deniedList: ['0xaf395754eB6F542742784cE7702940C60465A46d'] },
    },
  ]
};
```

You can set wildcard to allowList so that any address is allowed.
```typescript
// allowList: ['*'] is wildcard.

// Everyone can transact any contract.
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['*'] },
    },
  ];
}
```

When setting `allowList: ['']`, it means complete denial.
```typescript
// allowList: [''] is complete denial

// 0xaf395754eB6F542742784cE7702940C60465A46a cannot transact to any contract.
// But any address other than 0xaf395754eB6F542742784cE7702940C60465A46a can transact to any contract.
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['0xaf395754eB6F542742784cE7702940C60465A46a'] },
      toList: { allowList: [''] },
    },
  ];
}
```

deniedList setting is following.
```typescript

// 0xaf395754eB6F542742784cE7702940C60465A46a cannot transact to 0xaf395754eB6F542742784cE7702940C60465A46b
// But any address other than 0xaf395754eB6F542742784cE7702940C60465A46a can transact to 0xaf395754eB6F542742784cE7702940C60465A46b.
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['0xaf395754eB6F542742784cE7702940C60465A46a'] },
      toList: { deniedList: ['0xaf395754eB6F542742784cE7702940C60465A46b'] },
    },
  ];
};

// 0xaf395754eB6F542742784cE7702940C60465A46a cannot transact to 0xaf395754eB6F542742784cE7702940C60465A46b
// But any address other than 0xaf395754eB6F542742784cE7702940C60465A46a can transact to 0xaf395754eB6F542742784cE7702940C60465A46b.
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { deniedList: ['0xaf395754eB6F542742784cE7702940C60465A46a'] },
      toList: { allowList: ['0xaf395754eB6F542742784cE7702940C60465A46b'] },
    },
  ];
};
```

If you want to allow transacting factory and bridge contracts, please set those contract addresses to `to`.

```json
// Verse-Layer pre-deployed Contracts. Same address for all Verse-Layers.
L2StandardBridge: '0x4200000000000000000000000000000000000010',
L2StandardTokenFactory: '0x4200000000000000000000000000000000000012',
L2ERC721Bridge: '0x6200000000000000000000000000000000000001',
```

```typescript
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: [<FROM_YOU_WANT_TO_SET>] },
      toList: { allowList: [
        '0x4200000000000000000000000000000000000010',
        '0x4200000000000000000000000000000000000012',
        '0x6200000000000000000000000000000000000001',
      ] },
    },
    ...
  ];
};
```

#### Contract(Option)
You cant restrict to transact contract method.

```typescript
// everyone can only transact to greet and setGreeting to 0x5FbDB2315678afecb367f032d93F642f64180aa3
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['0x5FbDB2315678afecb367f032d93F642f64180aa3'] },
      contractMethodList: [
        'greet',
        'setGreeting(string)',
      ],
    },
  ];
};

// everyone can only transact to greet and setGreeting to 0x5FbDB2315678afecb367f032d93F642f64180aa3 and 0x5FbDB2315678afecb367f032d93F642f64180aa4
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: ['*'],
      toList: ['0x5FbDB2315678afecb367f032d93F642f64180aa3', '0x5FbDB2315678afecb367f032d93F642f64180aa4'],
      contractMethodList: [
        'greet',
        'setGreeting(string)',
      ],
    },
  ];
};
```

```typescript
// if contractMethodList is [], all transaction is allowed.
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['0x5FbDB2315678afecb367f032d93F642f64180aa3'] },
      contractMethodList: [],
    },
  ];
};
```

#### Value(Option)
You can control the token value of a transaction.

```typescript
// Only transactions with more than 1000000000000000000unit values are allowed.
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['*'] },
      value: { gt: '1000000000000000000' },
    }
  ];
};
```

| value's key  |  Comparison Operation  |
| ---- | ---- |
|  eq  |  txValue == condition is allowed  |
|  nq  |  txValue != condition is allowed  |
|  gt  |  txValue > condition is allowed  |
|  gte  |  txValue >= condition is allowed  |
|  lt  |  txValue < condition is allowed  |
|  lte  |  txValue <= condition is allowed  |

#### Webhook(Option)
You can add webhook setting that execute your original transaction restriction.

| key  |  description  | Required |
| ---- | ---- | ---- |
|  url  | Your restriction webhook url  | O |
|  headers  |  Information that you want to send to webhook(described later) as http_header | X |
|  timeout  |  Webhook request timeout(ms)  | O |
|  retry  |   Webhook request retry times  | O |
|  parse  | Whether to parse tx in the proxy(described later) | O |

```typescript
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['*'] },
      webhooks: [
        {
          url: 'https://localhost:8080',
          headers: {
            Authorization: 'Bearer xxxxxxxx',
          },
          timeout: 1000, // 1000 is 1 second.
          retry: 3,
          parse: false,
        },
      ],
    },
  ];
};

// You can set multiple webhook to `webhooks`.
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['*'] },
      webhooks: [
        {
          url: 'https://localhost:8080',
          headers: {
            Authorization: 'Bearer xxxxxxxx',
          },
          timeout: 1000, // 1000 is 1 second.
          retry: 3,
          parse: false,
        },
        {
          url: 'https://localhost:8000',
          timeout: 1000, // 1000 is 1 second.
          retry: 3,
          parse: false,
        },
      ],
    },
  ];
};
```

Webhook Request body patterns are following.

| Body key  |  Description  |
| ---- | ---- |
|  _meta.ip  |  client ip address  |
|  _meta.headers.host  |  jsonrpc host  |
|  _meta.headers.user-agent  |  client user agent  |
| * | transaction data is set in body according to parse setting.



In case that header is not set and parse setting is false
```typescript
// src/config/transactionAllowList.ts
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['*'] },
      webhooks: [
        {
          url: 'https://rpc.sandverse.oasys.games/',
          headers: { 
            host: 'rpc.sandverse.oasys.games',
            Authorization: 'Bearer xxxxxxxx',
          },
          timeout: 1000,
          retry: 3,
          parse: false,
        },
      ],
    },
  ];
};
```

```typescript
{
  // jsonrpc body is set
  method: 'eth_sendRawTransaction',
  params: [
    '0xf8c62780826b23945fbdb2315678afecb367f032d93f642f64180aa380b864a41368620000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000829deda02c108533361ec243ad0d7f88c07165327c1b14ec64565edbbd50d7193399f0b8a071de69bb3d7cd3aa8697c0a459b2ccc29401d715135cb8a34d2d703b7cd77f47'
  ],
  id: 56,
  jsonrpc: '2.0',
  // meta is client information
  _meta: {
    ip: '::1',
    headers: {
      host: 'localhost:3001',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    }
  }
}
```

In case that header is set Authorization and parse setting is true
```typescript
// src/config/transactionAllowList.ts
export const getTxAllowList = (): Array<TransactionAllow> => {
  return [
    {
      fromList: { allowList: ['*'] },
      toList: { allowList: ['*'] },
      webhooks: [
        {
          url: 'https://rpc.sandverse.oasys.games/',
          headers: {
            host: 'rpc.sandverse.oasys.games',
            Authorization: 'Bearer xxxxxxxx',
          },
          timeout: 1000,
          retry: 3,
          parse: true,
        },
      ],
    },
  ];
};
```

```typescript
{
  // parsed jsonrpc body is set
  nonce: 40,
  gasPrice: BigNumber { _hex: '0x00', _isBigNumber: true },
  gasLimit: BigNumber { _hex: '0x6b23', _isBigNumber: true },
  to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  value: BigNumber { _hex: '0x00', _isBigNumber: true },
  data: '0xa41368620000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000',
  chainId: 20197,
  v: 40429,
  r: '0x8a5a8f761bd45ba475b6b2a535a6d1a4d0941b657269b91ab19467e8a9d9d195',
  s: '0x11c0fb7057f3e18a6e01c324ff8a084abd369acc5289ab586c7f13b4ae88933d',
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  hash: '0x159625a3df0467d5be60adf105dfc5626294434f45d7f6ce4aeefbee9cedf383',
  type: null,
  // meta is client information
  _meta: {
    ip: '::1',
    headers: {
      host: 'localhost:3001',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    }
  }
}
```


#### Deployer
You can control deployer of a verse.

You can set either the allowed_address_list or the denied_address_list.

| Key  |  Description  |
| ---- | ---- |
|  allowList  |  Only the address specified here is allowed.  |
|  deniedList  |  Addresses other than the one specified here are permitted.  |


```typescript
// Only 0xaf395754eB6F542742784cE7702940C60465A46a can deploy
export const getDeployAllowList = (): Array<string> => {
  return { allowList: ['0xaf395754eB6F542742784cE7702940C60465A46a'] };
};

// Everyone can deploy
export const getDeployAllowList = (): Array<string> => {
  return { allowList: ['*'] };
};

// Everyone cannot deploy
export const getDeployAllowList = (): Array<string> => {
  return { allowList: [''] };
};

// 0xaf395754eB6F542742784cE7702940C60465A46a cannot deploy,
// But any address other than 0xaf395754eB6F542742784cE7702940C60465A46a can deploy
export const getDeployAllowList = (): Array<string> => {
  return { deniedList: ['0xaf395754eB6F542742784cE7702940C60465A46a'] };
};
```

### Set allowed header
You can set whether you inherit proxy request's host header on verse request at `src/config/configuration.ts`.
```typescript
inheritHostHeader: true,
```
