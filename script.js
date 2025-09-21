const URL = "./model/";
let model, webcam, uartCharacteristic;

async function init() {
  model = await tmImage.load(URL + "model.json", URL + "metadata.json");
  webcam = new tmImage.Webcam(224, 224, true);
  await webcam.setup();
  await webcam.play();
  document.getElementById("webcam").appendChild(webcam.canvas);
  predictLoop();
}

async function predictLoop() {
  while (true) {
    const prediction = await model.predict(webcam.canvas);
    const top = prediction.reduce((a, b) => (a.probability > b.probability ? a : b));
    if (top.probability > 0.9) {
      sendToMicrobit(top.className + "\n");
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function connectMicrobit() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: "BBC micro:bit" }],
    optionalServices: [0xFFE0]
  });
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(0xFFE0);
  uartCharacteristic = await service.getCharacteristic(0xFFE1);
}

function sendToMicrobit(message) {
  if (uartCharacteristic) {
    const encoder = new TextEncoder();
    uartCharacteristic.writeValue(encoder.encode(message));
  }
}

init();
