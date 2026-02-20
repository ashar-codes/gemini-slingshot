export const getStrategicHint = async (
  imageBase64: string,
  validTargets: any[],
  dangerRow: number
) => {
  const res = await fetch("/api/strategic-hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      validTargets,
      dangerRow
    })
  })

  return res.json()
}
