// lightweight mock auth endpoint for prototyping
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;
    // very naive demo token
    return res
      .status(200)
      .json({ user: { id: 'demo-user', email }, token: 'demo-token' });
  }
  res.status(405).end();
}
