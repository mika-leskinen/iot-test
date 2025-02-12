class HttpPost {
  static async sendJson(url, data) {
    try {
      const responseJson = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!responseJson.ok) {
        console.error(
          "httpPost - sendJson: err: http response status " +
            responseJson.status
        );
        return false;
      }

      const response = await responseJson.json();

      if (response?.msg !== "OK") {
        console.error(
          "httpPost - sendJson: err: http response " + response.msg
        );
        return false;
      }
      console.log("httpPost - sendJson: OK");
      return true;
    } catch (err) {
      console.error("httpPost - sendJson: err: " + err.message);
      return false;
    }
  }
}

module.exports = HttpPost;
