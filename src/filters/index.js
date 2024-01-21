import Vue from "vue";

import { Decimal } from "decimal.js";

Vue.filter(
  "thousandFixed",
  (number, precision) => {
    if (number) {
      let str = new Decimal(number).dividedBy(10000).toFixed(precision, Decimal.ROUND_DOWN);
      str = str.replace(/\d+/, matched => {
        return matched.replace(/\B(?=(\d{3})+$)/g, ',');
      })
      return str;
    }
    return "";
  }
);
