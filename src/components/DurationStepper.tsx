type DurationUnit = 's' | 'm';

interface DurationStepperProps {
  value: number;
  unit: DurationUnit;
  min?: number;
  onChange: (value: number, unit: DurationUnit) => void;
  inputClass?: string;
}

function stepDelta(unit: DurationUnit): number {
  return unit === 'm' ? 1 : 10;
}

export function DurationStepper({ value, unit, min = 1, onChange, inputClass = 'inline-input duration-input' }: DurationStepperProps) {
  return (
    <div class="num-stepper">
      <button
        class="num-stepper-btn"
        type="button"
        onClick={() => {
          const delta = stepDelta(unit);
          if (value - delta >= min) onChange(value - delta, unit);
        }}
      >
        -
      </button>
      <input
        type="number"
        class={inputClass}
        value={value}
        onInput={(e) => {
          const next = parseInt((e.target as HTMLInputElement).value, 10);
          if (Number.isFinite(next) && next >= min) onChange(next, unit);
        }}
        min={String(min)}
      />
      <button class="num-stepper-btn" type="button" onClick={() => onChange(value + stepDelta(unit), unit)}>+</button>
      <button
        type="button"
        class="num-stepper-btn num-stepper-unit"
        onClick={() => onChange(value, unit === 'm' ? 's' : 'm')}
      >
        {unit}
      </button>
    </div>
  );
}
