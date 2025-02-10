class RandomData {
  // These should work anywhere

  // async for consistency
  static async getRandomFloat(min = 0, max = 100) {
    // return pseudorandom float value between min and max (2 decimals)
    return parseFloat(parseFloat(Math.random() * (max - min) + min).toFixed(2));
  }
}

module.exports = RandomData;
