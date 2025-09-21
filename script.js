const URL = "./model/";
let model, webcam, uartCharacteristic;

// Load the Teachable Machine model and start webcam
async function init() {
  model = await tmImage.load(URL + "model.json", URL + "metadata.json");
  webcam = new tmImage.Webcam(224, 224, true); // width, height, flip
  await webcam.setup();
  await webcam.play();
  document.getElementById("webcam").appendChild(webcam.canvas);
  predictLoop();
}

// Continuously predict and send result to micro:bit
async function predictLoop() {
  while (true) {
    const prediction = await model.predict(webcam.canvas);
    const top = prediction.reduce((a, b) => (a.probability > b.probability ? a : b));

    if (top.probability > 0.9) {
      sendToMicrobit(top.className + "\n");
    }

    await new Promise(r => setTimeout(r, 1000)); // wait 1 second
  }
}

// Connect to micro:bit via Bluetooth
async function connectMicrobit() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('
