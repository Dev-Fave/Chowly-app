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
app.use(express.json());

app.post('/api/orders', async (req, res) => {
try {
const { customer_id, restaurant_id, items } = req.body;

let totalWaitTime = 0;
let orderDetails = [];

for (const item of items) {
const menuItem = await pool.query('SELECT * FROM menu_item WHERE id = $1', [item.menu_item_id]);
const row = menuItem.rows[0];
const prepMinutes = parseInt(row.prep_time);
if (prepMinutes > totalWaitTime) totalWaitTime = prepMinutes;
orderDetails.push(`${item.quantity}x ${row.item_name}`);
}

const orderResult = await pool.query(
`INSERT INTO "order" (customer_id, restaurant_id, waiting_time, details, status)
VALUES ($1, $2, $3, $4, 'Pending') RETURNING id`,
[customer_id, restaurant_id, `${totalWaitTime} mins`, orderDetails.join(', ')]
);
const orderId = orderResult.rows[0].id;

for (const item of items) {
const menuItem = await pool.query('SELECT price FROM menu_item WHERE id = $1', [item.menu_item_id]);
await pool.query(
`INSERT INTO order_item (order_id, menu_item_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
[orderId, item.menu_item_id, item.quantity, menuItem.rows[0].price]
);
}

res.json({ order_id: orderId, waiting_time: `${totalWaitTime} mins`, details: orderDetails.join(', ') });
} catch (err) {
res.status(500).send('Error placing order: ' + err.message);
}
});


app.get('/api/orders', async (req, res) => {
try {
const result = await pool.query(`SELECT * FROM "order" ORDER BY order_date DESC`);
res.json(result.rows);
} catch (err) {
res.status(500).send('Error fetching orders: ' + err.message);
}
});

app.patch('/api/orders/:id/assign', async (req, res) => {
try {
const { id } = req.params;
const { waiter_id, chef_id, bartender_id } = req.body;

await pool.query(
`UPDATE "order" SET waiter_id = $1, chef_id = $2, bartender_id = $3, status = 'Served' WHERE id = $4`,
[waiter_id, chef_id, bartender_id, id]
);

res.json({ message: 'Order assigned and marked as served' });
} catch (err) {
res.status(500).send('Error assigning order: ' + err.message);
}
});



app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
