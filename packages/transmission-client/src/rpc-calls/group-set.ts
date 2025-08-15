export type Request = {
  honorsSessionLimits?: boolean;
  name: string;
  "speed-limit-down-enabled"?: boolean;
  "speed-limit-down"?: number;
  "speed-limit-up-enabled"?: boolean;
  "speed-limit-up"?: number;
};

export type Response = void;