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
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    uartCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

    console.log("Connected to micro:bit");
  } catch (error) {
    console.error("Bluetooth connection failed:", error);
  }
}


function sendToMicrobit(message) {
  if (uartCharacteristic) {
    const encoder = new TextEncoder();
    uartCharacteristic.writeValue(encoder.encode(message));
  }
}

init();

