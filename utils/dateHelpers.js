function getDateRange(type, value) {
  const start = new Date();
  const end = new Date();

  if (type === "daily") {
    const date = new Date(value);
    return {
      start: date.toISOString().slice(0, 10),
      end: date.toISOString().slice(0, 10)
    };
  }

  if (type === "weekly") {
    const [year, week] = value.split("-").map(Number);
    const firstDay = new Date(year, 0, 1 + (week - 1) * 7);
    const day = firstDay.getDay();
    const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
    start.setFullYear(year, 0, diff);
    end.setFullYear(year, 0, diff + 6);
  }

  if (type === "monthly") {
    const [year, month] = value.split("-").map(Number);
    start.setFullYear(year, month - 1, 1);
    end.setFullYear(year, month, 0);
  }

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

module.exports = { getDateRange };