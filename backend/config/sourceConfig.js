/**
 * SOURCE_CONFIG defines the reliability and verification levels 
 * for various data origins in the GigID ecosystem.
 */
export const SOURCE_CONFIG = {
  platform: {
    reliability: 1.0,
    verification: "high"
  },
  bank: {
    reliability: 0.7,
    verification: "high"
  },
  unknown: {
    reliability: 0.5,
    verification: "medium"
  },
  manual: {
    reliability: 0.3,
    verification: "low"
  }
};

