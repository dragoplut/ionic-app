export type T_INTERFACE_CHARACTERISTICS = {
  type?: string,
  name: string,
  service: string,
  characteristic: string,
  descriptors?: any[],
  properties: string[]
};

export type T_DEVICE_INTERFACE = {
  services: string[],
  characteristics: T_INTERFACE_CHARACTERISTICS[]
};

export type T_LOCATION_PARAMS = {
  countryName?: string,
  stateName?: string
};
