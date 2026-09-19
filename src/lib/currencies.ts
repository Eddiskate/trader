export const CURRENCY_NAMES: Record<string, string> = {
  THB: "bat tajski",
  USD: "dolar amerykański",
  AUD: "dolar australijski",
  HKD: "dolar hongkoński",
  CAD: "dolar kanadyjski",
  NZD: "dolar nowozelandzki",
  SGD: "dolar singapurski",
  EUR: "euro",
  HUF: "forint",
  CHF: "frank szwajcarski",
  GBP: "funt szterling",
  UAH: "hrywna",
  JPY: "jen",
  CZK: "korona czeska",
  DKK: "korona duńska",
  ISK: "korona islandzka",
  NOK: "korona norweska",
  SEK: "korona szwedzka",
  RON: "lej rumuński",
  BGN: "lew bułgarski",
  TRY: "lira turecka",
  ILS: "nowy izraelski szekel",
  CLP: "peso chilijskie",
  PHP: "peso filipińskie",
  MXN: "peso meksykańskie",
  ZAR: "rand",
  BRL: "real brazylijski",
  MYR: "ringgit",
  IDR: "rupia indonezyjska",
  INR: "rupia indyjska",
  KRW: "won południowokoreański",
  CNY: "yuan",
  XDR: "SDR",
};

export const DEFAULT_WATCHED = ["EUR", "USD", "GBP", "CHF"];

export function currencyName(code: string) {
  return CURRENCY_NAMES[code] ?? code;
}
