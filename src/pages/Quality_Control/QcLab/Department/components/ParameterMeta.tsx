// department/components/ParameterMeta.tsx
export default function ParameterMeta({ parameter, value }: any) {
  const { config } = parameter;

  if (!config) return null;

  const grey = { color: "#9E9E9E", fontSize: 12 };
  const warn = { color: "#F97316", fontSize: 12 };
  const danger = { color: "#EF4444", fontSize: 12 };

  const num = Number(value);

  let colorStyle = grey;
  if (!isNaN(num) && config.min_value != null && config.max_value != null) {
    if (num < config.min_value) colorStyle = warn;
    else if (num > config.max_value) colorStyle = danger;
  }

  return (
    <div style={colorStyle}>
      {config.default_value && (
        <>
          Recommended: {config.default_value}
          {config.unit || ""} |{" "}
        </>
      )}
      {config.min_value != null && config.max_value != null && (
        <>
          Range: {config.min_value} – {config.max_value}
          {config.unit || ""}
        </>
      )}
    </div>
  );
}
