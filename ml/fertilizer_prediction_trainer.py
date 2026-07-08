#!/usr/bin/env python3
"""
AgriMind AI - Fertilizer Recommendation Model Trainer
Model Architecture: Feedforward Neural Network (Keras Multi-Layer Perceptron with categorical features)
Exports to: quantized_fertilizer_model.tflite
"""

import os
import io
import json
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

# -----------------------------------------------------------------------------
# 1. Loading & Generating Dataset
# -----------------------------------------------------------------------------
print("--- Loading Fertilizer Prediction Dataset ---")

csv_file_path = "dataset/fertilizer_prediction.csv"

# Embedded sample of standard fertilizer prediction data to guarantee compile and run-readiness
EMBEDDED_FERTILIZER_DATA = """Temperature,Humidity,Moisture,Soil Type,Crop Type,Nitrogen,Potassium,Phosphorous,Fertilizer Name
26,52,38,Sandy,Maize,37,0,0,Urea
29,52,45,Loamy,Sugarcane,12,0,36,DAP
34,65,62,Clayey,Cotton,13,0,34,DAP
32,62,34,Red,Tobacco,22,0,20,28-28
28,54,32,Black,Paddy,14,0,15,17-17-17
26,52,35,Sandy,Barley,12,10,13,10-26-26
29,58,33,Loamy,Wheat,9,9,9,14-35-14
33,64,50,Clayey,Millets,41,0,0,Urea
25,50,42,Red,Oil seeds,21,0,18,28-28
21,50,30,Black,Pulses,10,17,13,10-26-26
28,54,38,Sandy,Groundnuts,36,0,0,Urea"""

if os.path.exists(csv_file_path):
    print(f"Reading active fertilizer dataset from: {csv_file_path}")
    df = pd.read_csv(csv_file_path)
else:
    print("Using embedded dataset representation to build model pipeline...")
    df = pd.read_csv(io.StringIO(EMBEDDED_FERTILIZER_DATA))
    
    # Generate realistic synthetic records to support multi-class neural density training
    np.random.seed(42)
    synthetic_samples = []
    soils = ['Sandy', 'Loamy', 'Clayey', 'Red', 'Black']
    crops = ['Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Groundnuts']
    fertilizers = ['Urea', 'DAP', '14-35-14', '28-28', '17-17-17', '20-20', '10-26-26']
    
    for _ in range(800):
        soil = np.random.choice(soils)
        crop = np.random.choice(crops)
        fert = np.random.choice(fertilizers)
        
        # Core nutrient patterns mapping back to realistic fertilizer choices
        if fert == 'Urea':
            n, p, k = np.random.randint(35, 46), 0, 0
            temp = np.random.randint(24, 38)
            moist = np.random.randint(25, 42)
        elif fert == 'DAP':
            n, p, k = np.random.randint(10, 19), np.random.randint(30, 48), 0
            temp = np.random.randint(25, 36)
            moist = np.random.randint(40, 65)
        elif fert == '28-28':
            n, p, k = np.random.randint(20, 30), np.random.randint(20, 30), 0
            temp = np.random.randint(22, 34)
            moist = np.random.randint(30, 50)
        elif fert == '10-26-26':
            n, p, k = np.random.randint(5, 12), np.random.randint(20, 28), np.random.randint(20, 28)
            temp = np.random.randint(20, 32)
            moist = np.random.randint(25, 40)
        else: # general compound NPK
            n, p, k = np.random.randint(10, 20), np.random.randint(10, 20), np.random.randint(10, 20)
            temp = np.random.randint(21, 35)
            moist = np.random.randint(30, 55)
            
        sample = {
            'Temperature': temp,
            'Humidity': np.random.randint(50, 75),
            'Moisture': moist,
            'Soil Type': soil,
            'Crop Type': crop,
            'Nitrogen': n,
            'Potassium': k,
            'Phosphorous': p,
            'Fertilizer Name': fert
        }
        synthetic_samples.append(sample)
        
    df_synthetic = pd.DataFrame(synthetic_samples)
    df = pd.concat([df, df_synthetic], ignore_index=True)
    os.makedirs(os.path.dirname(csv_file_path), exist_ok=True)
    df.to_csv(csv_file_path, index=False)
    print(f"Synthetic fertilizer database generated and saved to: {csv_file_path}")

print(f"Total dataset entries: {len(df)}")

# -----------------------------------------------------------------------------
# 2. Categorical Encodings & Normalization
# -----------------------------------------------------------------------------
print("\n--- Encoding Categorical Parameters ---")

# Save categorical class order maps to recreate inputs precisely inside Dart code
soil_categories = sorted(df['Soil Type'].unique().tolist())
crop_categories = sorted(df['Crop Type'].unique().tolist())

print(f"Soil Type Classes ({len(soil_categories)}): {soil_categories}")
print(f"Crop Type Classes ({len(crop_categories)}): {crop_categories}")

# Preprocessing: Map soil and crop classes to fixed integer classes manually to avoid layout shift
df['Soil_Encoded'] = df['Soil Type'].map(lambda x: soil_categories.index(x))
df['Crop_Encoded'] = df['Crop Type'].map(lambda x: crop_categories.index(x))

# Map target label
encoder = LabelEncoder()
df['Label_Encoded'] = encoder.fit_transform(df['Fertilizer Name'])
NUM_CLASSES = len(encoder.classes_)

print(f"\nRecommended Fertilizers Mapping ({NUM_CLASSES} classes):")
for idx, label in enumerate(encoder.classes_):
    print(f"  Index {idx:02d} -> {label}")

# Prepare features array
# Input layout: [Temp, Humid, Moisture, Soil_Encoded, Crop_Encoded, N, K, P]
feature_cols = ['Temperature', 'Humidity', 'Moisture', 'Soil_Encoded', 'Crop_Encoded', 'Nitrogen', 'Potassium', 'Phosphorous']
X = df[feature_cols].values
y = df['Label_Encoded'].values

# Split data: 80% Train, 10% Val, 10% Test
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.10, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.1111, random_state=42, stratify=y_train_val
)

# Apply StandardScaler only to the numerical features to maintain encoder stability
# Scaler feature columns indices: Temperature(0), Humidity(1), Moisture(2), Nitrogen(5), Potassium(6), Phosphorous(7)
scaler = StandardScaler()
X_train_numeric = scaler.fit_transform(X_train[:, [0, 1, 2, 5, 6, 7]])
X_val_numeric = scaler.transform(X_val[:, [0, 1, 2, 5, 6, 7]])
X_test_numeric = scaler.transform(X_test[:, [0, 1, 2, 5, 6, 7]])

# Reassemble features [Temp_S, Humid_S, Moist_S, Soil_Encoded, Crop_Encoded, N_S, K_S, P_S]
def reassemble_features(numeric_scaled, original_array):
    assembled = np.zeros_like(original_array, dtype=np.float32)
    assembled[:, 0] = numeric_scaled[:, 0]  # Temp
    assembled[:, 1] = numeric_scaled[:, 1]  # Humid
    assembled[:, 2] = numeric_scaled[:, 2]  # Moist
    assembled[:, 3] = original_array[:, 3]  # Soil (Unscaled integer class)
    assembled[:, 4] = original_array[:, 4]  # Crop (Unscaled integer class)
    assembled[:, 5] = numeric_scaled[:, 3]  # Nitrogen
    assembled[:, 6] = numeric_scaled[:, 4]  # Potassium
    assembled[:, 7] = numeric_scaled[:, 5]  # Phosphorous
    return assembled

X_train_scaled = reassemble_features(X_train_numeric, X_train)
X_val_scaled = reassemble_features(X_val_numeric, X_val)
X_test_scaled = reassemble_features(X_test_numeric, X_test)

# Convert labels to categorical distribution format
y_train_cat = tf.keras.utils.to_categorical(y_train, num_classes=NUM_CLASSES)
y_val_cat = tf.keras.utils.to_categorical(y_val, num_classes=NUM_CLASSES)
y_test_cat = tf.keras.utils.to_categorical(y_test, num_classes=NUM_CLASSES)

# -----------------------------------------------------------------------------
# 3. Model Architecture (Keras Dense Sequential MLP)
# -----------------------------------------------------------------------------
print("\n--- Constructing Multi-Layer Perceptron (MLP) ---")

model = models.Sequential([
    layers.Input(shape=(8,)),
    layers.Dense(64, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    
    layers.Dense(32, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    
    layers.Dense(16, activation='relu'),
    layers.Dense(NUM_CLASSES, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.002),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# -----------------------------------------------------------------------------
# 4. Training the Model
# -----------------------------------------------------------------------------
print("\n--- Training Model ---")

callbacks = [
    tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=0.00001)
]

history = model.fit(
    X_train_scaled, y_train_cat,
    validation_data=(X_val_scaled, y_val_cat),
    epochs=100,
    batch_size=16,
    callbacks=callbacks,
    verbose=1
)

# -----------------------------------------------------------------------------
# 5. Model Evaluation
# -----------------------------------------------------------------------------
print("\n--- Evaluating Model ---")

predictions = model.predict(X_test_scaled)
y_pred_classes = np.argmax(predictions, axis=1)

acc = accuracy_score(y_test, y_pred_classes)
print(f"\nFinal Test Accuracy: {acc * 100:.2f}%")
print("\nClassification Report (Precision, Recall, F1-Score per Class):")
print(classification_report(y_test, y_pred_classes, target_names=encoder.classes_))

# Save encoder/categories details as JSON config companion to support developers
config_companion = {
    "means": scaler.mean_.tolist(),
    "stds": np.sqrt(scaler.var_).tolist(),
    "soil_types": soil_categories,
    "crop_types": crop_categories,
    "fertilizer_names": encoder.classes_.tolist()
}

with open("fertilizer_meta_config.json", "w") as f:
    json.dump(config_companion, f, indent=2)
print("Saved fertilizer metadata companion schema: fertilizer_meta_config.json")

# -----------------------------------------------------------------------------
# 6. Save model and convert to TFLite (Float16 Quantization)
# -----------------------------------------------------------------------------
print("\n--- Converting Model to TFLite Binary ---")

# Save Keras representation
model_h5_path = "fertilizer_prediction_model.h5"
model.save(model_h5_path)

# Convert to TFLite format
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.compat.v1.lite.constants.FLOAT16]
tflite_model = converter.convert()

tflite_save_path = "quantized_fertilizer_model.tflite"
with open(tflite_save_path, "wb") as f:
    f.write(tflite_model)

print(f"Fertilizer Prediction Model successfully exported: {tflite_save_path}")
print(f"Size of exported TFLite Binary: {os.path.getsize(tflite_save_path) / 1024:.2f} KB")
print("\nTFLite Export Complete!")
