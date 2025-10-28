let classifier;
const video = document.getElementById("webcam");
const predictionText = document.getElementById("prediction");
const enableCamButton = document.getElementById("enableCam");
const container = document.getElementById("videoContainer");
const percentageElement = document.getElementById("percentage");
const animalLabelElement = document.getElementById("animalLabel");
const confidenceCircle = document.getElementById("confidenceCircle");

let smoothConfidence = 0;

// Activa la cámara y carga el modelo
async function enableCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.style.display = "block";
    enableCamButton.classList.add("disabled");
    enableCamButton.innerText = "Cámara activada";
    predictionText.innerText = "🔍 Cargando modelo...";

    // ✅ Cargar el modelo usando la URL explícita del archivo model.json
    const modelURL = 'model/model.json';
    classifier = await ml5.imageClassifier(modelURL, video, modelReady);

  } catch (err) {
    console.error("❌ Error al acceder a la cámara:", err);
    predictionText.innerText = "❗ Permite el acceso a la cámara.";
  }
}

// Cuando el modelo esté listo
function modelReady() {
  console.log("✅ Modelo cargado correctamente.");
  predictionText.innerText = "✅ Modelo listo. Analizando en tiempo real...";
  predictLoop();
}

// Bucle continuo de predicciones
function predictLoop() {
  if (!classifier) return;

  classifier.classify((error, results) => {
    if (error) {
      console.error("❌ Error en la clasificación:", error);
      predictionText.innerText = "⚠️ Error al clasificar.";
      setTimeout(predictLoop, 500);
      return;
    }

    if (!results || results.length === 0) {
      console.log("⚠️ Sin resultados válidos");
      predictionText.innerText = "📷 Analizando...";
      percentageElement.innerText = "0%";
      animalLabelElement.innerText = "Esperando...";
      confidenceCircle.style.borderColor = "#ccc";
      setTimeout(predictLoop, 500);
      return;
    }

    const { label, confidence } = results[0];
    smoothConfidence = smoothConfidence * 0.7 + confidence * 0.3;
    const conf = Math.round(smoothConfidence * 100);

    // Actualizar círculo de porcentaje
    percentageElement.innerText = `${conf}%`;
    animalLabelElement.innerText = label;

    // Cambiar color del círculo según la clase
    const normalizedLabel = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    container.className = "container"; // Resetear clases

    if (conf < 25) {
      predictionText.innerText = `🤔 No estoy seguro (${conf}% confianza)`;
      confidenceCircle.style.borderColor = "#ccc";
    } else {
      predictionText.innerText = `🧠 ${label} (${conf}% confianza)`;

      switch (normalizedLabel) {
        case "paloma":
          container.classList.add("paloma-border");
          confidenceCircle.style.borderColor = "#5dade2";
          break;
        case "tucan":
          container.classList.add("tucan-border");
          confidenceCircle.style.borderColor = "#58d68d";
          break;
        case "colibri":
          container.classList.add("colibri-border");
          confidenceCircle.style.borderColor = "#f4d03f";
          break;
        case "condor":
          container.classList.add("condor-border");
          confidenceCircle.style.borderColor = "#e74c3c";
          break;
      }
    }

    setTimeout(predictLoop, 500);
  });
}

// Evento del botón
enableCamButton.addEventListener("click", enableCamera);