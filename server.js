import amqp from 'amqplib';
import express from 'express';
const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/', (req, res) => res.send('Welcome to the Express RabbitMQ app!'));

app.get('/send', async (req, res) => {
  const message = 'Hello RabbitMQ!';
  await sendMessage(message);
  res.send(`Message sent: ${message}`);
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await consumeMessages();
});

async function sendMessage(message) {
  try {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    const queue = 'message_queue';
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Message sent: ${message}`);
    connection.close();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

async function consumeMessages() {
  try {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    const queue = 'message_queue';
    await channel.assertQueue(queue, { durable: false });
    console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);
    channel.consume(queue, (msg) => {
      console.log(`Received message: ${msg.content.toString()}`);
    }, { noAck: true });
  } catch (error) {
    console.error('Error consuming messages:', error);
  }
};