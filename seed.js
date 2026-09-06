const pool = require('./db');

async function seed() {
try {
const restaurant = await pool.query(
`INSERT INTO restaurant (name, location) VALUES ('Chowly Restaurant', 'Lagos') RETURNING id`
);
const restaurantId = restaurant.rows[0].id;

await pool.query(`INSERT INTO waiter (name, restaurant_id) VALUES ('John Waiter', $1)`, [restaurantId]);
await pool.query(`INSERT INTO chef (name, restaurant_id) VALUES ('Amaka Chef', $1)`, [restaurantId]);
await pool.query(`INSERT INTO bartender (name, restaurant_id) VALUES ('Tunde Bartender', $1)`, [restaurantId]);

const menu = await pool.query(
`INSERT INTO menu (name, restaurant_id) VALUES ('Main Menu', $1) RETURNING id`, [restaurantId]
);
const menuId = menu.rows[0].id;

await pool.query(`
INSERT INTO menu_item (menu_id, item_name, category, price, prep_time, availability) VALUES
($1, 'Jollof Rice', 'food', 3500, '15 mins', 'available'),
($1, 'Grilled Chicken', 'food', 4500, '20 mins', 'available'),
($1, 'Chapman', 'drink', 2000, '5 mins', 'available'),
($1, 'Zobo', 'drink', 1500, '5 mins', 'available')
`, [menuId]);

console.log('Seed data added successfully!');
} catch (err) {
console.log('Error seeding data:', err.message);
} finally {
pool.end();
}
}

seed();

