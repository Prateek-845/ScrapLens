let cache = {
  rates: [
    { item: "E-Waste", rate: "₹100/kg" },
    { item: "Iron/Metal", rate: "₹34/kg" },
    { item: "HDPE Plastic", rate: "₹13/kg" },
    { item: "Cardboard", rate: "₹7/kg" },
    { item: "Glass", rate: "₹10/kg" }
  ],
  lastUpdated: null
};

export const getMarketRates = async () => {
  const now = Date.now();
  if (cache.lastUpdated && (now - cache.lastUpdated < 3600000)) {
    return cache.rates;
  }

  try {
    const res = await fetch("https://scraprates.in");
    if (!res.ok) throw new Error();
    const html = await res.text();

    const parsePrice = (regex, fallback) => {
      const match = html.match(regex);
      return match ? `₹${match[1]}/kg` : fallback;
    };

    cache.rates = [
      { item: "E-Waste", rate: parsePrice(/E-Waste.*?₹\s*(\d+)/i, "₹100/kg") },
      { item: "Iron/Metal", rate: parsePrice(/Iron.*?₹\s*(\d+)/i, "₹34/kg") },
      { item: "HDPE Plastic", rate: parsePrice(/Plastic.*?₹\s*(\d+)/i, "₹13/kg") },
      { item: "Cardboard", rate: parsePrice(/Cardboard.*?₹\s*(\d+)/i, "₹7/kg") },
      { item: "Glass", rate: parsePrice(/Glass.*?₹\s*(\d+)/i, "₹10/kg") }
    ];
    cache.lastUpdated = now;
  } catch (err) {
    cache.lastUpdated = now;
  }

  return cache.rates;
};
