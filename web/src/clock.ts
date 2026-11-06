// ============================================================
//  PommAI CRT Dashboard — Clock Module
// ============================================================

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

export function initClock(): void {
  const hoursEl = document.getElementById('clock-hours')!;
  const minutesEl = document.getElementById('clock-minutes')!;
  const secondsEl = document.getElementById('clock-seconds')!;
  const ampmEl = document.getElementById('clock-ampm')!;
  const dateEl = document.getElementById('clock-date')!;
  const dayEl = document.getElementById('clock-day')!;

  function tick(): void {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // 12-hour format
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;

    hoursEl.textContent = pad(h);
    minutesEl.textContent = pad(m);
    secondsEl.textContent = pad(s);
    ampmEl.textContent = ampm;

    const day = DAYS[now.getDay()];
    const month = MONTHS[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();

    dateEl.textContent = `${month} ${date}, ${year}`;
    dayEl.textContent = day;
  }

  tick();
  setInterval(tick, 1000);
}

