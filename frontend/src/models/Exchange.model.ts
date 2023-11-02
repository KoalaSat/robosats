import { weightedMean, getHigherVer } from '../utils';
import { type Federation, type Version } from '.';

interface ExchangeInfo {
  num_public_buy_orders: number;
  num_public_sell_orders: number;
  book_liquidity: number;
  active_robots_today: number;
  last_day_nonkyc_btc_premium: number;
  last_day_volume: number;
  lifetime_volume: number;
  version: Version;
}

const defaultExchangeInfo: ExchangeInfo = {
  num_public_buy_orders: 0,
  num_public_sell_orders: 0,
  book_liquidity: 0,
  active_robots_today: 0,
  last_day_nonkyc_btc_premium: 0,
  last_day_volume: 0,
  lifetime_volume: 0,
  version: { major: 0, minor: 0, patch: 0 },
};

export const updateExchangeInfo = (federation: Federation): ExchangeInfo => {
  const info: ExchangeInfo = defaultExchangeInfo;
  const premiums: number[] = [];
  const volumes: number[] = [];
  let highestVersion: Version = { major: 0, minor: 0, patch: 0 };

  const aggregations = [
    'num_public_buy_orders',
    'num_public_sell_orders',
    'book_liquidity',
    'active_robots_today',
    'last_day_volume',
    'lifetime_volume',
  ];

  Object.values(federation.coordinators).forEach((coordinator, index) => {
    if (coordinator.info !== undefined && coordinator.enabled === true) {
      premiums[index] = coordinator.info.last_day_nonkyc_btc_premium;
      volumes[index] = coordinator.info.last_day_volume;
      highestVersion = getHigherVer(highestVersion, coordinator.info.version);

      aggregations.forEach((key: any) => {
        info[key] = Number(info[key]) + Number(coordinator.info[key]);
      });
    }
    return null;
  });

  info.last_day_nonkyc_btc_premium = weightedMean(premiums, volumes);
  info.version = highestVersion;

  return info;
};

export interface Exchange {
  info: ExchangeInfo;
  onlineCoordinators: number;
  totalCoordinators: number;
}

export const defaultExchange: Exchange = {
  info: defaultExchangeInfo,
  onlineCoordinators: 0,
  totalCoordinators: 0,
};

export default Exchange;
