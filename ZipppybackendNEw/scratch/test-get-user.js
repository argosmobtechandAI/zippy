import jwt from 'jsonwebtoken';
const token = jwt.sign({ id: '42609310-a2b6-4849-9d91-cd015e0400aa', type: 'rider' }, 'zippy@admin', { expiresIn: '1d' });
console.log(token);
