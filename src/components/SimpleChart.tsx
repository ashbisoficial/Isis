export function SimpleLineChart({ points, unit = '' }: { points: { date: string; value: number }[]; unit?: string }) {
  if (points.length === 0) return null
  const width = 320
  const height = 120
  const padding = 24

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? width / 2 : padding + (i / (points.length - 1)) * (width - padding * 2)
    const y = height - padding - ((p.value - min) / range) * (height - padding * 2)
    return { x, y, ...p }
  })

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <path d={path} fill="none" stroke="#a78bfa" strokeWidth={2} />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={3} fill="#c4b5fd" />
      ))}
      <text x={padding} y={12} fill="#ffffff80" fontSize={10}>
        {max}{unit}
      </text>
      <text x={padding} y={height - 6} fill="#ffffff80" fontSize={10}>
        {min}{unit}
      </text>
    </svg>
  )
}
