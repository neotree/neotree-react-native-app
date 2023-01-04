export function diffHours(dt2: Date, dt1: Date)  {
    let diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return  Math.abs(Math.round(diff)); // Math.round(diff);
}
