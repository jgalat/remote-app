export type BandwidthGroup = {
  honorsSessionLimits: boolean;
  name: string;
  "speed-limit-down-enabled": boolean;
  "speed-limit-down": number;
  "speed-limit-up-enabled": boolean;
  "speed-limit-up": number;
};

export type Request = {
  group?: string | string[];
};

export type Response = {
  group: BandwidthGroup[];
};