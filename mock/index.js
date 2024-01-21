const Mock = require('mockjs');
//格式： Mock.mock( url, post/get , 返回的数据)；
Mock.mock(
  '/api/v1/margin/get/token_config',
  'get',
  require('./json/tokenConfig')
);
Mock.mock(
  '/api/v1/margin/get/interest_config',
  'get',
  require('./json/interestConfig')
);
Mock.mock(
  '/api/v1/margin/get/risk_config',
  'get',
  require('./json/riskConfig')
);
Mock.mock('/api/v1/symbol/query/mock', 'get', require('./json/symbolQuery'));
Mock.mock(
  '/api/v1/margin/get/pool_account',
  'get',
  require('./json/poolAccount')
);
Mock.mock(
  '/api/v1/margin/get/cross_loan_order',
  'get',
  require('./json/crossLoanOrder')
);
Mock.mock(
  '/api/v1/margin/coin_pool/query',
  'get',
  require('./json/coinPoolQuery')
);
Mock.mock(
  '/api/v1/margin/user_risk/statistics',
  'get',
  require('./json/riskStatistics')
);
Mock.mock('/api/v1/margin/user_risk/query', 'get', require('./json/riskQuery'));
Mock.mock(
  '/api/v1/margin/user_position_detail/query',
  'get',
  require('./json/positionDetailQuery')
);
Mock.mock(
  '/api/v1/margin/get/repay_record',
  'get',
  require('./json/repayRecord')
);
Mock.mock(
  '/api/v1/margin/force_close/query',
  'get',
  require('./json/forceCloseQuery')
);
Mock.mock('/api/v1/margin/risk/statistics', 'get', require('./json/riskTotal'));
