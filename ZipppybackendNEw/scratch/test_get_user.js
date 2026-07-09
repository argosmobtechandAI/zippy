import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', type: 'admin' }, 'zippy@admin');

async function checkUserEndpoint() {
  try {
    const res = await fetch('http://localhost:3000/api/users/a660a365-f7b7-46d0-a8a9-aadefa3ea30f', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) { console.error(e) }
}

checkUserEndpoint();
