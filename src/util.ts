
export const valueToDecimalStr = (value: string): string => {
	const valueStr = value.padStart(19, '0');
	const valueStrDecimal = valueStr.slice(0, -18) + '.' + valueStr.slice(-18);
	return valueStrDecimal;
}

