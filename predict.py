"""
Script de inferencia para modelo de Teachable Machine
Compatible con TensorFlow 2.15.1 / Python 3.10.10
Autor: [Tu nombre]
"""

import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import os

# === CONFIGURACIÓN ===
MODEL_PATH = "teachable/keras_model.h5"  # o carpeta SavedModel
LABELS_PATH = "teachable/labels.txt"     # opcional
IMG_SIZE = (224, 224)  # Teachable Machine usa 224x224 por defecto

# === CARGAR MODELO ===
print("🔹 Cargando modelo...")
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("✅ Modelo cargado correctamente.")
except Exception as e:
    print("❌ Error al cargar el modelo:", e)
    exit()

# === CARGAR ETIQUETAS ===
labels = None
if os.path.exists(LABELS_PATH):
    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        labels = [line.strip() for line in f.readlines()]
        print(f"🔹 {len(labels)} clases cargadas desde labels.txt.")
else:
    print("⚠️ No se encontró labels.txt, se mostrarán índices numéricos.")

# === FUNCIÓN DE PREDICCIÓN ===
def predict_image(img_path):
    """Carga una imagen y devuelve la predicción"""
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # batch
    img_array = img_array / 255.0  # normalizar
    predictions = model.predict(img_array)
    class_idx = int(np.argmax(predictions))
    confidence = float(np.max(predictions))
    
    if labels:
        class_name = labels[class_idx]
    else:
        class_name = f"Clase {class_idx}"

    return class_name, confidence

# === PROGRAMA PRINCIPAL ===
if __name__ == "__main__":
    test_image = "imagenes_prueba/palomasprueba.jpg"

    if not os.path.exists(test_image):
        print(f"⚠️ No se encontró {test_image}. Coloca una imagen ahí para probar.")
        exit()

    print(f"🔹 Analizando imagen: {test_image}")
    class_name, confidence = predict_image(test_image)
    print(f"\n🧩 Resultado: {class_name} ({confidence*100:.2f}% confianza)")
