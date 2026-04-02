export function SignalIcon({ strength = 4 }) {
  const bars = [1, 2, 3, 4];
  return (
    <div className="signal-icon">
      {bars.map((b) => (
        <div
          key={b}
          className={`bar ${b <= strength ? "on" : ""}`}
          style={{ height: b * 6 }}
        />
      ))}
    </div>
  );
}
