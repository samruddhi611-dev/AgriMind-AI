#!/usr/bin/env python3
"""
AgriMind AI - PlantVillage Disease Detection Model Trainer
Model Architecture: MobileNetV2 with Transfer Learning
Exports to: quantized_disease_model.tflite
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# -----------------------------------------------------------------------------
# 1. Configurations & Constants
# -----------------------------------------------------------------------------
DATASET_DIR = "dataset/plantvillage"  # Directory structured with class subfolders
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
CHANNELS = 3
EPOCHS = 15
NUM_CLASSES = 15  # Adjust based on final subset of classes
MODEL_SAVE_PATH = "plant_disease_model.h5"
TFLITE_SAVE_PATH = "quantized_disease_model.tflite"

print(f"TensorFlow Version: {tf.__version__}")
print("Configuring GPU settings if available...")
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("GPU available and memory growth configured.")
    except RuntimeError as e:
        print(f"GPU initialization error: {e}")

# -----------------------------------------------------------------------------
# 2. Data Generators & Augmentation (Cleaning & Preprocessing)
# -----------------------------------------------------------------------------
print("\n--- Initializing Data Generators ---")

# Setup augmentation for the training split to combat overfitting
train_datagen = ImageDataGenerator(
    rescale=1.0/255.0,           # Standardizing pixel values to [0, 1]
    rotation_range=25,          # Random rotations
    width_shift_range=0.2,      # Horizontal translation
    height_shift_range=0.2,     # Vertical translation
    shear_range=0.2,            # Shear angles
    zoom_range=0.15,            # Inside-zoom augmentations
    horizontal_flip=True,       # Mirroring
    vertical_flip=True,         # Flip vertically
    fill_mode='nearest',
    validation_split=0.2        # Setting aside 20% for validation/testing
)

# For testing, we only rescale the pixel values; no augmentation to preserve true distributions
test_datagen = ImageDataGenerator(rescale=1.0/255.0, validation_split=0.2)

# Create mock/dummy directories if we are doing a dry run
if not os.path.exists(DATASET_DIR):
    print(f"Dataset directory '{DATASET_DIR}' not found. Creating placeholder folders for verification...")
    # Creating dry-run directories
    sample_classes = ["Tomato___healthy", "Tomato___Early_blight", "Potato___Early_blight", "Potato___healthy"]
    for cls in sample_classes:
        os.makedirs(os.path.join(DATASET_DIR, cls), exist_ok=True)
        # Create a mock dummy image if empty to allow script execution
        dummy_img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        plt.imsave(os.path.join(DATASET_DIR, cls, "dummy_0.jpg"), dummy_img)
    NUM_CLASSES = len(sample_classes)

# Training Stream
train_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True,
    seed=42
)

# Validation Stream (Half of the 20% validation split = 10% total)
validation_generator = test_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False,
    seed=42
)

# Output Class-to-Index Mappings for Dart Code
class_indices = train_generator.class_indices
class_labels = {v: k for k, v in class_indices.items()}
print("\nClass mappings detected:")
for idx, name in class_labels.items():
    print(f"  Class {idx:02d} -> {name}")

# -----------------------------------------------------------------------------
# 3. Model Architecture (MobileNetV2 with Transfer Learning)
# -----------------------------------------------------------------------------
print("\n--- Constructing MobileNetV2 Transfer Learning Model ---")

# Load base MobileNetV2 with pre-trained ImageNet weights, excluding the top dense layers
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], CHANNELS),
    include_top=False,
    weights='imagenet'
)

# Freeze the convolutional base weights to preserve feature extraction filters
base_model.trainable = False

# Build standard sequential top layers for classification
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),                  # Shrinks spatial dimensions
    layers.Dense(256, activation='relu'),             # Fully connected layer
    layers.Dropout(0.4),                              # Regularization to prevent overfitting
    layers.BatchNormalization(),                      # Maintain activation scaling
    layers.Dense(NUM_CLASSES, activation='softmax')   # Final logits mapping classes
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# -----------------------------------------------------------------------------
# 4. Model Training & Validation callbacks
# -----------------------------------------------------------------------------
print("\n--- Training Model ---")

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss', 
        patience=4, 
        restore_best_weights=True,
        verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', 
        factor=0.2, 
        patience=2, 
        min_lr=0.00001,
        verbose=1
    )
]

history = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // BATCH_SIZE,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // BATCH_SIZE,
    epochs=EPOCHS,
    callbacks=callbacks
)

# -----------------------------------------------------------------------------
# 5. Fine-Tuning Step (For Max Accuracy)
# -----------------------------------------------------------------------------
print("\n--- Commencing Fine-Tuning Stage ---")
# Unfreeze base model weights
base_model.trainable = True

# We only want to fine-tune top layers, freeze the early layers (up to index 100)
# Early layers detect low-level details (edges/blobs), later layers detect high-level structures (spots/lesions)
fine_tune_at = 100
for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False

# Recompile model with a much lower learning rate to prevent structural weight disruption
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.00005),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train for a few more epochs to fine-tune weights
history_fine = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // BATCH_SIZE,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // BATCH_SIZE,
    epochs=5,
    callbacks=callbacks
)

# Save the final compiled base model
model.save(MODEL_SAVE_PATH)
print(f"H5 Model successfully exported to: {MODEL_SAVE_PATH}")

# -----------------------------------------------------------------------------
# 6. Evaluation on Test Set
# -----------------------------------------------------------------------------
print("\n--- Evaluating Model Predictions ---")

# Retrieve true labels and predictions
val_steps = len(validation_generator)
y_true = validation_generator.classes

# Reset generator to prevent sample alignment displacement
validation_generator.reset()
predictions = model.predict(validation_generator, steps=val_steps)
y_pred = np.argmax(predictions, axis=1)

# Generate detailed evaluation report
acc = accuracy_score(y_true, y_pred)
print(f"\nFinal Accuracy: {acc * 100:.2f}%")
print("\nClassification Report (Precision, Recall, F1-Score per Class):")
print(classification_report(y_true, y_pred, target_names=list(class_indices.keys()) if 'class_indices' in locals() else None))

# -----------------------------------------------------------------------------
# 7. Convert and Export to TFLite (With Float16 Quantization)
# -----------------------------------------------------------------------------
print("\n--- Exporting to Optimized TFLite Binary ---")

converter = tf.lite.TFLiteConverter.from_keras_model(model)
# Apply optimization parameters
converter.optimizations = [tf.lite.Optimize.DEFAULT]
# Halve model size using float16 weights quantization
converter.target_spec.supported_types = [tf.compat.v1.lite.constants.FLOAT16]

tflite_quantized_model = converter.convert()

with open(TFLITE_SAVE_PATH, "wb") as f:
    f.write(tflite_quantized_model)

print(f"Quantized TFLite Model saved successfully: {TFLITE_SAVE_PATH}")
print(f"Unquantized model size: {os.path.getsize(MODEL_SAVE_PATH) / (1024*1024):.2f} MB")
print(f"Quantized TFLite model size: {os.path.getsize(TFLITE_SAVE_PATH) / (1024*1024):.2f} MB")
print("\nReady for integration into AgriMind AI Flutter application!")
