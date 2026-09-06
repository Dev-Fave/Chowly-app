const express = require('express');
const app = express();
const PORT = 5000; 
const pool = require('./db');

app.get('/', (req, res) => {
res.send('Chowly is alive!');
});
app.get('/db-test', async (req, res) => {
try {
const result = await pool.query('SELECT NOW()');
res.send(`Database connected! Time: ${result.rows[0].now}`);
} catch (err) {
res.send('Database connection failed: ' + err.message);
}
});

app.get('/api/menu', async (req, res) => {
try {
const result = await pool.query(`
SELECT id, item_name, category, price, prep_time, availability
FROM menu_item
WHERE availability = 'available'
`);
res.json(result.rows);
} catch (err) {
res.status(500).send('Error fetching menu: ' + err.message);
}
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
