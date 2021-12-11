export const getDateString = () => {
  const date = new Date();
  const Y = date.getFullYear();
  const M = ("00" + (date.getMonth() + 1)).slice(-2);
  const D = ("00" + date.getDate()).slice(-2);
  const h = ("00" + date.getHours()).slice(-2);
  const m = ("00" + date.getMinutes()).slice(-2);
  const s = ("00" + date.getSeconds()).slice(-2);

  return Y + M + D + h + m + s;
};
