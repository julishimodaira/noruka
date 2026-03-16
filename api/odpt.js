export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const apiKey = process.env.ODPT_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ODPT API key not configured' });

  const { type, operator } = req.query;
  if (!type) return res.status(400).json({ error: 'Missing type parameter' });

  const validTypes = ['TrainInformation', 'StationTimetable', 'Train', 'Station'];
  if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid type' });

  try {
    let url = `https://api.odpt.org/api/4/odpt:${type}?acl:consumerKey=${apiKey}`;
    if (operator) url += `&odpt:operator=odpt.Operator:${operator}`;

    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).json({ error: 'ODPT API error' });

    const data = await response.json();
    // Cache for 30 seconds for real-time data
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reach ODPT API' });
  }
}
