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

      /*
      if (this.client.connected) {
        console.log("mqtt - connected: " + this.host + ":" + this.port);
      } else {
        console.error("mqtt - err: not connected");
      }
        */
    } catch (err) {
      console.error("mqtt - err: " + err.message);
    }
  }

  // send data to broker as json
  publishJson(topic = "iot-test/telemetry", data) {
    try {
      if (this.client.connected) {
        this.client.publish(topic, JSON.stringify(data));
        console.log("mqtt - publish OK");
      } else {
        console.error("mqtt - publish err (" + topic + "): not connected");
      }
    } catch (err) {
      console.error("mqtt - publish err (" + topic + "): " + err.message);
    }
  }
}

module.exports = Mqtt;
