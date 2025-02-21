const mqtt = require("mqtt");

// see https://mqtt.org/getting-started/
// also see https://www.npmjs.com/package/mqtt
// and https://github.com/moscajs/aedes-cli
// and https://github.com/eclipse-mosquitto/mosquitto

class Mqtt {
  constructor(options = { host: "localhost", port: 1883, protocol: "mqtt" }) {
    try {
      this.host = options.host;
      this.port = options.port;
      this.protocol = options.protocol;

      this.client = mqtt.connect({
        host: this.host,
        port: this.port,
        protocol: this.protocol,
      });

      console.log("mqtt - connected: " + this.host + ":" + this.port);
    } catch (err) {
      console.error("mqtt - err: " + err.message);
    }
  }

  // send data to broker as json
  publishJson(topic = "iot-test/telemetry", data) {
    try {
      this.client.publish(topic, JSON.stringify(data));
      console.log("mqtt - publish OK");
    } catch (err) {
      console.error("mqtt - publish err (" + topic + "): " + err.message);
    }
  }
}

module.exports = Mqtt;
