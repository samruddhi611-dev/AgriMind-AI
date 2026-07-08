import 'dart:typed_data';
import 'package:tflite_flutter/tflite_flutter.dart';

/// Service class to handle Crop Recommendation using the custom-trained TFLite MLP.
///
/// Converts soil parameters (N, P, K, temperature, humidity, pH, rainfall) into scaled tensors.
class CropRecommendationService {
  Interpreter? _interpreter;
  List<String>? _crops;

  // Precomputed StandardScaler variables from Python training script
  // Mean (mu) and standard deviation (sigma) are required to scale raw user inputs identically
  static const List<double> _means = [50.55, 53.37, 48.11, 25.61, 71.49, 6.47, 103.46];
  static const List<double> _stds = [36.91, 32.96, 50.62, 5.08, 22.25, 0.77, 55.48];

  bool get isModelLoaded => _interpreter != null && _crops != null;

  /// Load model and populate class indices mapping array.
  Future<void> initialize() async {
    try {
      _interpreter = await Interpreter.fromAsset('assets/models/quantized_crop_model.tflite');
      
      // Class names mapped in order of LabelEncoder training labels
      _crops = [
        "apple", "banana", "blackgram", "chickpea", "coconut", "coffee", "cotton",
        "grapes", "jute", "kidneybeans", "lentil", "mango", "maize", "mothbeans",
        "mungbean", "muskmelon", "orange", "papaya", "pigeonpeas", "pomegranate",
        "rice", "watermelon"
      ];
      print("Crop Recommendation TFLite model loaded successfully.");
    } catch (e) {
      print("Failed to initialize Crop Recommendation Model: $e");
      rethrow;
    }
  }

  /// Scale input value on device matching StandardScaler logic.
  double _scaleValue(double value, double mean, double std) {
    if (std == 0.0) return 0.0;
    return (value - mean) / std;
  }

  /// Recommend the best crop to cultivate based on soil and climatic features.
  ///
  /// Inputs:
  /// - [n]: Nitrogen (mg/kg)
  /// - [p]: Phosphorus (mg/kg)
  /// - [k]: Potassium (mg/kg)
  /// - [temperature]: Temperature in °C
  /// - [humidity]: Relative humidity percentage
  /// - [ph]: Soil pH (0-14)
  /// - [rainfall]: Average rainfall in mm
  ///
  /// Returns a map with the recommended [crop] and the prediction [confidence] score.
  Future<Map<String, dynamic>> recommendCrop({
    required double n,
    required double p,
    required double k,
    required double temperature,
    required double humidity,
    required double ph,
    required double rainfall,
  }) async {
    if (!isModelLoaded) {
      throw StateError("Model has not been initialized. Call initialize() first.");
    }

    // 1. Pack inputs into a list
    final List<double> rawInputs = [n, p, k, temperature, humidity, ph, rainfall];

    // 2. Normalize inputs in-situ using the saved scaler coefficients
    final Float32List scaledInputs = Float32List(7);
    for (int i = 0; i < 7; i++) {
      scaledInputs[i] = _scaleValue(rawInputs[i], _means[i], _stds[i]);
    }

    // 3. Format input matrix as Float tensor shape [1, 7]
    final input = scaledInputs.reshape([1, 7]);

    // 4. Set aside memory for output probability distribution tensor shape [1, 22]
    final numClasses = _crops!.length;
    final output = List<double>.filled(numClasses, 0.0).reshape([1, numClasses]);

    // 5. Execute inference
    _interpreter!.run(input, output);

    // 6. Decode output softmax probabilities
    final List<double> probabilities = List<double>.from(output[0]);
    
    // Find highest probability class index
    int bestClassIndex = 0;
    double maxConfidence = -1.0;
    for (int i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxConfidence) {
        maxConfidence = probabilities[i];
        bestClassIndex = i;
      }
    }

    // Read the safe boundary index to return the crop label
    String recommendedCrop = _crops![bestClassIndex];

    return {
      'crop': recommendedCrop,
      'confidence': maxConfidence,
      'probabilities': probabilities,
    };
  }
}
