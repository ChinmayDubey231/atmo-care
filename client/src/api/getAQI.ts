export const getAQI = async (lat: number, lon: number) => {
  try {
    const url = process.env.EXPO_PUBLIC_OPEN_WEATHER_URL;
    const apiKey = process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY;

    if (!url || !apiKey) {
      console.error("Still missing variables. URL:", url, "Key:", apiKey);
      return null;
    }

    const res = await fetch(`${url}?lat=${lat}&lon=${lon}&appid=${apiKey}`);

    if (!res.ok) {
      const errorData = await res.json();
      console.error("OpenWeather API Error:", errorData);
      return null;
    }

    const data = await res.json();
    return {
      aqi: data?.list?.[0]?.main?.aqi,
      pm25: data?.list?.[0]?.components?.pm2_5,
      pm10: data?.list?.[0]?.components?.pm10,
    };
  } catch (error) {
    console.error("Network or Parsing Error:", error);
    return null;
  }
};
