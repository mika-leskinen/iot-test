class Http {
  async postJson(url, data) {
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
          "http - postJson (" +
            url +
            "): err: http response status " +
            responseJson.status
        );
        return false;
      }

      const response = await responseJson.json();

      if (response?.msg !== "OK") {
        console.error(
          "http - postJson (" + url + "): err: http response " + response.msg
        );
        return false;
      }
      console.log("http - postJson (" + url + "): OK");
      return true;
    } catch (err) {
      console.error("http - postJson (" + url + "): err: " + err.message);
      return false;
    }
  }
}

module.exports = Http;
