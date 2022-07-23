export const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatNumber = (n: number) => {
  if (n < 1000) {
    return n.toString();
  } else {
    return (n / 1000).toFixed(1) + 'k';
  }
};
