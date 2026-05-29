// customs.js — Swiss customs duty, VAT, and clearance fee calculator.
// Rules (2026): small consignment relief < CHF 65, VAT 8.1%, Swiss Post fee CHF 11.50

const SWISS_VAT_RATE = 0.081
const SWISS_POST_CLEARANCE_FEE = 11.50
const SMALL_CONSIGNMENT_THRESHOLD_CHF = 65.00

const DEFAULT_DUTY_RATES = {
  electronics: 0.00,
  clothing: 0.12,
  footwear: 0.17,
  general: 0.04,
}

/**
 * Calculate Swiss customs costs for a shipment.
 * @param {number} declaredValueCHF
 * @param {number} shippingCostCHF
 * @param {string} category — 'electronics'|'clothing'|'footwear'|'general'
 * @param {object} config — tracker config (for duty rates)
 */
export function calculateCustoms(declaredValueCHF, shippingCostCHF, category, config) {
  const dutyRates = config?.tracker?.customs?.duty_rates ?? DEFAULT_DUTY_RATES
  const dutyRate = dutyRates[category] ?? dutyRates.general ?? 0.04

  const importValue = declaredValueCHF + shippingCostCHF

  if (importValue < SMALL_CONSIGNMENT_THRESHOLD_CHF) {
    return {
      vat: 0, duty: 0, clearanceFee: 0, total: 0,
      note: `small consignment relief (import value CHF ${importValue.toFixed(2)} < CHF ${SMALL_CONSIGNMENT_THRESHOLD_CHF})`,
      breakdown: { importValue, threshold: SMALL_CONSIGNMENT_THRESHOLD_CHF },
    }
  }

  const vat = importValue * SWISS_VAT_RATE
  const duty = declaredValueCHF * dutyRate
  const clearanceFee = SWISS_POST_CLEARANCE_FEE
  const total = vat + duty + clearanceFee

  return {
    vat: round2(vat),
    duty: round2(duty),
    clearanceFee,
    total: round2(total),
    note: `VAT 8.1% on CHF ${importValue.toFixed(2)}, duty ${(dutyRate * 100).toFixed(0)}% on CHF ${declaredValueCHF.toFixed(2)}, Swiss Post fee`,
    breakdown: { importValue, vatRate: SWISS_VAT_RATE, dutyRate, declaredValueCHF, shippingCostCHF },
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}
