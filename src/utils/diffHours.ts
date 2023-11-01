export function diffHours(dt2: Date, dt1: Date)  {
    let diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return  Math.abs(Math.round(diff)); // Math.round(diff);
}

export function diffHours2(num: number) {
	if(num < 1) return '0';
	const qualifier = (num: number) => (num > 1 ? 's' : '');
	const numToStr = (num: number, unit: string) => num > 0 ? ` ${num} ${unit}${qualifier(num)}` : '';
	const oneMinute = 60;
	const oneHour = oneMinute * 60;
	const oneDay = oneHour * 24;
	const oneYear = oneDay * 365;
	const times: { [key: string]: number; } = {
		year: ~~(num / oneYear),
		day: ~~((num % oneYear) / oneDay),
		hour: ~~((num % oneDay) / oneHour),
		minute: ~~((num % oneHour) / oneMinute),
		second: ~~(num % oneMinute),
	};
	let str = '';
	for (let [key] of Object.entries(times)) {
		str += numToStr(times[key], key);
	}
	const arr = str.trim().split(' ');
	const res: string[] = [];
	arr.forEach((x, i) => {
		if (i % 2 === 0 && i !== 0) res.push(i === arr.length - 2 ? 'and' : ',');
		res.push(x);
	});
	return res.join(' ').replace(/\s,/g, ',');
}
