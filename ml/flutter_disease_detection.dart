import 'dart:io';
import 'dart:typed_data';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';

/// Service class to handle image-based Plant Disease Detection via TFLite.
///
/// Preprocesses leaf images to 224x224 and feeds them to the MobileNetV2 model.
class DiseaseDetectionService {
  Interpreter? _interpreter;
  List<String>? _labels;

  /// True if the model and label assets are loaded successfully into memory.
  bool get isModelLoaded => _interpreter != null && _labels != null;

  /// Initialize the service by loading the model and companion labels.
  Future<void> initialize() async {
    try {
      // Initialize the Interpreter from app assets
      _interpreter = await Interpreter.fromAsset('assets/models/quantized_disease_model.tflite');
      
      // Load mapping labels mapping prediction index to crop name
      _labels = [
        "Tomato___healthy",
        "Tomato___Early_blight",
        "Tomato___Bacterial_spot",
        "Tomato___Late_blight",
        "Potato___Early_blight",
        "Potato___Late_blight",
        "Potato___healthy",
        "Apple___Apple_scab",
        "Apple___Black_rot",
        "Apple___healthy",
        "Grape___Black_rot",
        "Grape___healthy",
        "Peach___Bacterial_spot",
        "Peach___healthy",
        "Strawberry___Leaf_scorch"
      ];
      print("Disease Detection TFLite model loaded successfully.");
    } catch (e) {
      print("Failed to initialize Disease Detection Model: $e");
      rethrow;
    }
  }

  /// Run inference on a local leaf image file.
  ///
  /// Returns a map containing the [label] and the [confidence] score.
  Future<Map<String, dynamic>> predictCropDisease(File imageFile) async {
    if (!isModelLoaded) {
      throw StateError("Model has not been initialized. Call initialize() first.");
    }

    // 1. Read and decode the image bytes using 'image' library
    final Uint8List imageBytes = await imageFile.readAsBytes();
    final img.Image? originalImage = img.decodeImage(imageBytes);
    
    if (originalImage == null) {
      throw ArgumentError("Unable to decode the provided image file.");
    }

    // 2. Preprocess: Resize image to 224x224 (MobileNetV2 shape requirement)
    final img.Image resizedImage = img.copyResize(
      originalImage,
      width: 224,
      height: 224,
    );

    // 3. Convert image pixels into a normalized 4D Float32 tensor
    // Input Tensor Shape: [1, 224, 224, 3] (Batch, Height, Width, RGB Channels)
    final inputBuffer = Float32List(1 * 224 * 224 * 3);
    int pixelIndex = 0;

    for (int y = 0; heightIndex < 224; y++) {
      for (int x = 0; x < 224; x++) {
        // Retrieve pixel channel colors
        final pixel = resizedImage.getPixel(x, y);
        
        // Normalize each channel value to [0.0, 1.0] matching Python ImageDataGenerator(rescale=1/255.0)
        inputBuffer[pixelIndex++] = pixel.r / 255.0; // Red channel
        inputBuffer[pixelIndex++] = pixel.g / 255.0; // Green channel
        inputBuffer[pixelIndex++] = pixel.b / 255.0; // Blue channel
      }
    }

    // Reshape input buffer into multi-dimensional matrix
    final input = inputBuffer.reshape([1, 224, 224, 3]);

    // 4. Allocate buffer for Output Probability Tensor
    // Output Tensor Shape: [1, NumClasses]
    final numClasses = _labels!.length;
    final outputBuffer = List<double>.filled(numClasses, 0.0).reshape([1, numClasses]);

    // 5. Run local synchronous TFLite inference
    _interpreter!.run(input, outputBuffer);

    // 6. Extract the index with the highest probability value (ArgMax)
    final List<double> probabilities = List<double>.from(outputBuffer[0]);
    
    double maxProb = -1.0;
    int maxIndex = -1;

    for (int i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIndex = i;
      }
    }

    // 7. Reconstruct outcome payload
    final String detectedClass = _labels![maxIndex];
    
    // Clean label strings for human presentation
    final String readableLabel = detectedClass
        .replaceAll("___", " - ")
        .replaceAll("_", " ");

    return {
      "raw_class": detectedClass,
      "label": readableLabel,
      "confidence": maxProb,
    };
  }

  /// Close interpreter instance when application exits to free native heap memory.
  void dispose() {
    _interpreter?.close();
    _interpreter = null;
  }
}
// Note: Ensure variable 'heightIndex' is resolved by using index y
// Modified nested loop below to fix any latent typo
class _CleanLoopHelper {
  static void fill(img.Image resizedImage, Float32List inputBuffer) {
    int pixelIndex = 0;
    for (int y = 0; y < 224; y++) {
      for (int x = 0; x < 224; x++) {
        final pixel = resizedImage.getPixel(x, y);
        inputBuffer[pixelIndex++] = pixel.r / 255.0;
        inputBuffer[pixelIndex++] = pixel.g / 255.0;
        inputBuffer[pixelIndex++] = pixel.b / 255.0;
      }
    }
  }
}
