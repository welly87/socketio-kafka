var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
const kafka = require('kata-kafka');
const avro = require('kata-avsc');

const type = avro.parse('./message.avsc', {registry: this.registry})

var consumer = new kafka.KafkaConsumer({
  'group.id': 'kafka',
  'metadata.broker.list': 'localhost:9092',
}, {});

// Flowing mode
consumer.connect();

consumer
  .on('ready', function() {
    consumer.subscribe(['tele-log']);

    // Consume from the librdtesting-01 topic. This is what determines
    // the mode we are running in. By not specifying a callback (or specifying
    // only a callback) we get messages as soon as they are available.
    consumer.consume();
  })
  .on('data', function(data) {
    const val = type.fromBuffer(data.value, null, true);
    console.log(val.obj.message)
    io.emit('chat message', val.obj.message);
  });

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });


http.listen(port, function(){
  console.log('listening on *:' + port);
});
