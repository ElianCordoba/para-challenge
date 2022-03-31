import fastify from 'fastify';
import cors from 'fastify-cors';

const server = fastify({ logger: true });

server.register(cors);

server.register((instance, opsts, next) => {
  instance.get('/', async (request, reply) => {
    return { hello: 'world' }
  })

  instance.post('/body', async (request, reply) => {
    console.log(request.body)
    return { hello: 'world' }
  })

  next()
}, { prefix: '/api/v1' })



const start = async () => {
  try {
    await server.listen(3000)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
console.log("Listening to port: 3000");