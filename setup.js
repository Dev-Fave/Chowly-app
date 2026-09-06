const pool = require('./db');

async function createTables() {
try {
await pool.query(`
CREATE TABLE IF NOT EXISTS restaurant (id SERIAL PRIMARY KEY, name TEXT, location TEXT);
CREATE TABLE IF NOT EXISTS customer (id SERIAL PRIMARY KEY, name TEXT, phone TEXT);
CREATE TABLE IF NOT EXISTS waiter (id SERIAL PRIMARY KEY, name TEXT, restaurant_id INT REFERENCES restaurant(id));
CREATE TABLE IF NOT EXISTS chef (id SERIAL PRIMARY KEY, name TEXT, restaurant_id INT REFERENCES restaurant(id));
CREATE TABLE IF NOT EXISTS bartender (id SERIAL PRIMARY KEY, name TEXT, restaurant_id INT REFERENCES restaurant(id));
CREATE TABLE IF NOT EXISTS menu (id SERIAL PRIMARY KEY, name TEXT, restaurant_id INT REFERENCES restaurant(id));
CREATE TABLE IF NOT EXISTS menu_item (id SERIAL PRIMARY KEY, menu_id INT REFERENCES menu(id), item_name TEXT, category TEXT, price NUMERIC, prep_time TEXT, availability TEXT);
CREATE TABLE IF NOT EXISTS "order" (id SERIAL PRIMARY KEY, customer_id INT REFERENCES customer(id), restaurant_id INT REFERENCES restaurant(id), waiter_id INT REFERENCES waiter(id), chef_id INT REFERENCES chef(id), bartender_id INT REFERENCES bartender(id), order_date TIMESTAMP DEFAULT NOW(), status TEXT DEFAULT 'Pending', waiting_time TEXT, details TEXT);
CREATE TABLE IF NOT EXISTS order_item (id SERIAL PRIMARY KEY, order_id INT REFERENCES "order"(id), menu_item_id INT REFERENCES menu_item(id), quantity INT, unit_price NUMERIC);
CREATE TABLE IF NOT EXISTS complaint (id SERIAL PRIMARY KEY, order_id INT REFERENCES "order"(id), customer_id INT REFERENCES customer(id), complaint_text TEXT, complaint_date TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS rating (id SERIAL PRIMARY KEY, order_id INT REFERENCES "order"(id), customer_id INT REFERENCES customer(id), rating_value TEXT, rating_date TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS payment (id SERIAL PRIMARY KEY, order_id INT REFERENCES "order"(id), method TEXT, status TEXT, amount NUMERIC, is_pretend BOOLEAN DEFAULT TRUE, paid_at TIMESTAMP DEFAULT NOW());
`);
console.log('All tables created successfully!');
} catch (err) {
console.log('Error creating tables:', err.message);
} finally {
pool.end();
}
}

createTables();

