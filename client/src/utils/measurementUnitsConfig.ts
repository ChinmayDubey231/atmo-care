export interface MeasurementOption {
  value: string;
  label: string;
  description: string;
}

export const measurements: MeasurementOption[] = [
  {
    value: "metric",
    label: "Metric",
    description: "µg/m³ — micrograms per cubic metre",
  },
  {
    value: "imperial",
    label: "Imperial",
    description: "ppm — parts per million",
  },
  { value: "us", label: "US standard", description: "AQI — Air Quality Index" },
];

export const getMeasurementLabel = (value: string) =>
  measurements.find((m) => m.value === value)?.label ?? value;
