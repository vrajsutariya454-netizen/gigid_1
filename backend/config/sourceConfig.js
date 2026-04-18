/**
 * SOURCE_CONFIG defines the reliability and verification levels 
 * for various data origins in the GigID ecosystem.
 */
export const SOURCE_CONFIG = {
  uber_api: {
    type: "platform",
    reliability: 0.95,
    verification: "high"
  },
  swiggy_api: {
    type: "platform",
    reliability: 0.9,
    verification: "high"
  },
  zomato_api: {
    type: "platform",
    reliability: 0.9,
    verification: "high"
  },
  ola_api: {
    type: "platform",
    reliability: 0.92,
    verification: "high"
  },
  aa_bank: {
    type: "aa",
    reliability: 1.0,
    verification: "very_high"
  },
  manual_entry: {
    type: "manual",
    reliability: 0.3,
    verification: "low"
  },
  csv_upload: {
    type: "upload",
    reliability: 0.5,
    verification: "medium"
  }
};
