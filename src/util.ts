// Proclaim timestamps are .NET ticks - convert them to a Unix timestamp
export function ticksToUnixTime(tick: number): number {
	return (tick - 621355968000000000) / 10000
}
