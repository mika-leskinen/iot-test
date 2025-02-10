const Rpi5 = require("./rpi5");
const RandomData = require("./randomData");

//

const main = async () => {
  //console.log(await Rpi5.getCpuTemp());
  console.log(await RandomData.getRandomFloat(20, 200));
};

main();
