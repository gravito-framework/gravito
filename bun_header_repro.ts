
const r = new Response('ok')
r.headers.append('Set-Cookie', 'a=1')
r.headers.append('Set-Cookie', 'b=2')

console.log('get(Set-Cookie):', r.headers.get('Set-Cookie'))
console.log('getSetCookie():', r.headers.getSetCookie?.())
