#!/usr/bin/env python3
"""
AgriMind AI - Crop Recommendation Model Trainer
Model Architecture: Feedforward Neural Network (Keras Multi-Layer Perceptron)
Exports to: quantized_crop_model.tflite
"""

import os
import io
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

# -----------------------------------------------------------------------------
# 1. Loading & Parsing Dataset
# -----------------------------------------------------------------------------
print("--- Loading Crop Recommendation Dataset ---")

# Let's check if the crop recommendation dataset is available locally
csv_file_path = "dataset/crop_recommendation.csv"

# Embedded sample of user's dataset to guarantee compilation and run-readiness
EMBEDDED_CSV_DATA = """N,P,K,temperature,humidity,ph,rainfall,label
90,42,43,20.87974371,82.00274423,6.502985292000001,202.9355362,rice
85,58,41,21.77046169,80.31964408,7.038096361,226.6555374,rice
60,55,44,23.00445915,82.3207629,7.840207144,263.9642476,rice
74,35,40,26.49109635,80.15836264,6.980400905,242.8640342,rice
78,42,42,20.13017482,81.60487287,7.628472891,262.7173405,rice
69,37,42,23.05804872,83.37011772,7.073453503,251.0549998,rice
69,55,38,22.70883798,82.63941394,5.70080568,271.3248604,rice
94,53,40,20.27774362,82.89408619,5.718627177999999,241.9741949,rice
89,54,38,24.51588066,83.53521629999999,6.685346424,230.4462359,rice
68,58,38,23.22397386,83.03322691,6.336253525,221.2091958,rice
71,54,16,22.61359953,63.69070564,5.7499144210000015,87.75953857,maize
61,44,17,26.10018422,71.57476937,6.931756557999999,102.2662445,maize
80,43,16,23.55882094,71.59351368,6.657964753,66.71995467,maize
73,58,21,19.97215954,57.68272924,6.596060648,60.65171481,maize
40,72,77,17.02498456,16.98861173,7.485996067,88.55123143,chickpea
23,72,84,19.02061277,17.13159126,6.920251378,79.92698081,chickpea
39,58,85,17.88776475,15.40589717,5.9969320370000005,68.54932919,chickpea
13,60,25,17.13692774,20.59541693,5.68597166,128.256862,kidneybeans
25,70,16,19.63474332,18.90705639,5.759237003,106.3598183,kidneybeans
31,55,22,22.91350245,21.33953114,5.873171894,109.225556,kidneybeans
3,72,24,36.51268371,57.92887167,6.03160778,122.6539694,pigeonpeas
40,59,23,36.89163721,62.73178224,5.269084669,163.7266551,pigeonpeas
3,49,18,27.91095209,64.70930606,3.692863601,32.67891866,mothbeans
22,59,23,27.32220619,51.27868781,4.371745575,36.5037914,mothbeans
19,55,20,27.43329405,87.80507732,7.18530147,54.73367631,mungbean
8,54,20,28.3340432,80.77275974,7.034214276,38.7976407,mungbean
56,79,15,29.48439992,63.19915325,7.454532137,71.89090748,blackgram
25,62,21,26.73433965,68.13999721,7.040056094,67.15096376,blackgram
32,76,15,28.05153602,63.49802189,7.604110177000001,43.35795377,lentil
13,61,22,19.44084326,63.27771461,7.728832424,46.83130119,lentil
2,24,38,24.55981624,91.63536236,5.922935513,111.9684622,pomegranate
6,18,37,19.65690085,89.93701023,5.937649577999999,108.0458926,pomegranate
91,94,46,29.36792366,76.24900101,6.149934034,92.82840911,banana
105,95,50,27.33368994,83.67675197,5.849076099,101.0494791,banana
2,40,27,29.73770045,47.54885174,5.954626604,90.09586854,mango
39,24,31,33.55695561,53.72979826,4.757114897,98.67527561,mango
24,130,195,29.99677232,81.54156612,6.112305667,67.12534492,grapes
13,144,204,30.7280404,82.42614055,6.092241627000001,68.38135469,grapes
119,25,51,26.47330219,80.92254421,6.283818329,53.65742581,watermelon
119,19,55,25.18780042,83.44621709,6.818261382999999,46.87420883,watermelon
115,17,55,27.57826922,94.11878202,6.776533055,28.08253201,muskmelon
114,27,48,27.82054812,93.03555162,6.528404377999999,26.32405487,muskmelon
24,128,196,22.75088787,90.69489172,5.521466996,110.4317855,apple
7,144,197,23.8494014,94.34814995,6.133220586,114.0512495,apple
22,30,12,15.78144173,92.51077745,6.3540067439999985,119.035002,orange
37,6,13,26.03097313,91.50819306,7.511755067999999,101.2847738,orange
61,68,50,35.21462816,91.49725058,6.7932454170000005,243.0745066,papaya
58,46,45,42.39413392,90.79028064,6.576261427,88.46607497,papaya
18,30,29,26.762749300000007,92.86056895,6.4200187170000005,224.5903664,coconut
37,23,28,25.61294367,94.3138837,5.7400545670000005,224.3206759,coconut
133,47,24,24.40228894,79.19732001,7.231324765,90.8022356,cotton
136,36,20,23.09595631,84.86275707,6.925412377000001,71.29581071,cotton
89,47,38,25.52468965,72.24850829,6.002524871,151.8869972,jute
60,37,39,26.59104992,82.94164078,6.033485257000001,161.2469997,jute
91,21,26,26.33377983,57.36469955,7.261313694,191.6549412,coffee
107,21,26,26.45288458,55.32222678,7.235070264,144.68613359999995,coffee"""

if os.path.exists(csv_file_path):
    print(f"Reading active crop recommendation dataset from: {csv_file_path}")
    df = pd.read_csv(csv_file_path)
else:
    print("Using embedded dataset representation to build model pipeline...")
    # Read the embedded string representation into a pandas DataFrame
    df = pd.read_csv(io.StringIO(EMBEDDED_CSV_DATA))
    # Generate some synthetic entries based on sample ranges to populate larger arrays for neural training
    np.random.seed(42)
    synthetic_samples = []
    classes = df['label'].unique()
    
    # Generate 100 extra synthetic samples per class for training depth
    for cls in classes:
        cls_df = df[df['label'] == cls]
        # Calculate stats for the class
        means = cls_df.mean(numeric_only=True)
        stds = cls_df.std(numeric_only=True).fillna(5.0)  # default std to 5 if only one record
        for _ in range(80):
            sample = {}
            for col in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
                # Sample from normal distribution
                val = np.random.normal(means[col], stds[col])
                # Ensure constraints
                if col in ['N', 'P', 'K', 'rainfall']:
                    val = max(0.0, val)
                elif col == 'ph':
                    val = np.clip(val, 3.5, 9.5)
                elif col == 'humidity':
                    val = np.clip(val, 10.0, 100.0)
                sample[col] = val
            sample['label'] = cls
            synthetic_samples.append(sample)
    
    df_synthetic = pd.DataFrame(synthetic_samples)
    df = pd.concat([df, df_synthetic], ignore_index=True)
    os.makedirs(os.path.dirname(csv_file_path), exist_ok=True)
    df.to_csv(csv_file_path, index=False)
    print(f"Dataset generated and cached locally at: {csv_file_path}")

print(f"Total dataset entries: {len(df)}")
print("First 5 records of parsed dataset:")
print(df.head())

# -----------------------------------------------------------------------------
# 2. Data Preprocessing (Cleaning, Splitting & Normalization)
# -----------------------------------------------------------------------------
print("\n--- Preprocessing Soil Parameters ---")

# Separate features and target label
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']].values
y = df['label'].values

# Stratified division: 80% Train, 10% Val, 10% Test
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.10, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.1111, random_state=42, stratify=y_train_val
)

print(f"Data Splitted: Train = {X_train.shape[0]} | Val = {X_val.shape[0]} | Test = {X_test.shape[0]}")

# Normalization using StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)

# Log Scaling Parameters (Save these and hardcode as static constants in the Flutter client)
print("\n--- CRITICAL scaling properties (Save to your Flutter app layout) ---")
print(f"MEAN (mu) per feature: {scaler.mean_}")
print(f"STD (sigma) per feature: {np.sqrt(scaler.var_)}")

# Label Encoding for categorical crop target
encoder = LabelEncoder()
y_train_encoded = encoder.fit_transform(y_train)
y_val_encoded = encoder.transform(y_val)
y_test_encoded = encoder.transform(y_test)

NUM_CLASSES = len(encoder.classes_)
print(f"Detected {NUM_CLASSES} unique crop target classes:")
for idx, crop in enumerate(encoder.classes_):
    print(f"  Index {idx:02d} -> {crop}")

# Convert labels to one-hot encodings for Keras softmax layer output
y_train_cat = tf.keras.utils.to_categorical(y_train_encoded, num_classes=NUM_CLASSES)
y_val_cat = tf.keras.utils.to_categorical(y_val_encoded, num_classes=NUM_CLASSES)
y_test_cat = tf.keras.utils.to_categorical(y_test_encoded, num_classes=NUM_CLASSES)

# -----------------------------------------------------------------------------
# 3. Build neural network layout (Multi-Layer Perceptron)
# -----------------------------------------------------------------------------
print("\n--- Constructing Multi-Layer Perceptron (MLP) ---")

model = models.Sequential([
    layers.Input(shape=(7,)),
    layers.Dense(128, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    
    layers.Dense(64, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    
    layers.Dense(32, activation='relu'),
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
print("\n--- Evaluating Crop Model ---")

predictions = model.predict(X_test_scaled)
y_pred_classes = np.argmax(predictions, axis=1)

acc = accuracy_score(y_test_encoded, y_pred_classes)
print(f"\nFinal Test Accuracy: {acc * 100:.2f}%")
print("\nClassification Report (Precision, Recall, F1-Score per Class):")
print(classification_report(y_test_encoded, y_pred_classes, target_names=encoder.classes_))

# -----------------------------------------------------------------------------
# 6. Save model and convert to TFLite (Float16 Quantization)
# -----------------------------------------------------------------------------
print("\n--- Converting Model to TFLite Binary ---")

# Save Keras representation
model_h5_path = "crop_recommendation_model.h5"
model.save(model_h5_path)

# Convert to TFLite format
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.compat.v1.lite.constants.FLOAT16] # Quantization
tflite_model = converter.convert()

tflite_save_path = "quantized_crop_model.tflite"
with open(tflite_save_path, "wb") as f:
    f.write(tflite_model)

print(f"Crop Recommendation Model successfully exported: {tflite_save_path}")
print(f"Size of exported TFLite Binary: {os.path.getsize(tflite_save_path) / 1024:.2f} KB")
print("\nTFLite Export Complete!")
print("Use the following mean and standard deviation values in Flutter:")
print(f"  Double Array Mean: {list(scaler.mean_)}")
print(f"  Double Array Std: {list(np.sqrt(scaler.var_))}")
print(f"  Target Crops Mapping: {list(encoder.classes_)}")
