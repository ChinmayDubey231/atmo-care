import type { Units } from "@/api/types";

export type DisplayUnits = "metric" | "us";

export interface MeasurementOption {
  value: DisplayUnits;
  label: string;
  description: string;
}

export const measurements: MeasurementOption[] = [
  {
    value: "metric",
    label: "µg/m³",
    description: "Particle concentration, micrograms per cubic metre",
  },
  {
    value: "us",
    label: "US AQI",
    description: "EPA index, 0 to 500+, estimated from current readings",
  },
];

/**
 * How readings are shown. "imperial" used to be offered, but particles can't
 * be measured in imperial units, so anyone who chose it sees µg/m³.
 */
export const displayUnits = (units: Units | null | undefined): DisplayUnits =>
  units === "us" ? "us" : "metric";

export const getMeasurementLabel = (units: Units | null | undefined) =>
  measurements.find((m) => m.value === displayUnits(units))?.label ?? "µg/m³";
