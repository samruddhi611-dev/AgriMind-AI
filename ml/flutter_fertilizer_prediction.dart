import 'dart:typed_data';
import 'package:tflite_flutter/tflite_flutter.dart';

/// Service class to handle Fertilizer Recommendation using the custom-trained TFLite MLP.
///
/// Preprocesses soil types, crop types, and raw environmental parameters into a composite tensor.
class FertilizerPredictionService {
  Interpreter? _interpreter;
  List<String>? _fertilizers;

  // Precomputed statistics from Python training scaler for numerical variables
  // Scaled features order in Python scaler: [Temperature, Humidity, Moisture, Nitrogen, Potassium, Phosphorous]
  static const List<double> _means = [27.97, 62.48, 43.12, 23.48, 4.35, 14.86];
  static const List<double> _stds = [4.32, 7.15, 11.23, 11.45, 6.78, 12.35];

  // Static constant categorical mapping indices from Python training metadata
  static const List<String> _soils = ['Black', 'Clayey', 'Loamy', 'Red', 'Sandy'];
  static const List<String> _crops = [
    'Barley', 'Cotton', 'Groundnuts', 'Maize', 'Millets',
    'Oil seeds', 'Paddy', 'Pulses', 'Sugarcane', 'Tobacco', 'Wheat'
  ];

  bool get isModelLoaded => _interpreter != null && _fertilizers != null;

  /// Load the interpreter and labels.
  Future<void> initialize() async {
    try {
      _interpreter = await Interpreter.fromAsset('assets/models/quantized_fertilizer_model.tflite');
      
      // Target outputs in index order of LabelEncoder training labels
      _fertilizers = [
        "10-26-26", "14-35-14", "17-17-17", "20-20", "28-28", "DAP", "Urea"
      ];
      print("Fertilizer Recommendation TFLite model loaded successfully.");
    } catch (e) {
      print("Failed to initialize Fertilizer Recommendation Model: $e");
      rethrow;
    }
  }

  /// Scale a specific raw value using mean and standard deviation.
  double _scaleValue(double value, double mean, double std) {
    if (std == 0.0) return 0.0;
    return (value - mean) / std;
  }

  /// Recommend the optimal fertilizer based on the current context.
  ///
  /// Inputs:
  /// - [temperature]: Temperature in °C
  /// - [humidity]: Humidity in %
  /// - [moisture]: Soil moisture content in %
  /// - [soilType]: Soil category string (e.g. 'Sandy')
  /// - [cropType]: Target crop category string (e.g. 'Maize')
  /// - [nitrogen]: Soil nitrogen level (mg/kg)
  /// - [potassium]: Soil potassium level (mg/kg)
  /// - [phosphorous]: Soil phosphorus level (mg/kg)
  Future<Map<String, dynamic>> predictFertilizer({
    required double temperature,
    required double humidity,
    required double moisture,
    required String soilType,
    required double nitrogen,
    required double potassium,
    required double phosphorous,
    required String cropType,
  }) async {
    if (!isModelLoaded) {
      throw StateError("Model has not been initialized. Call initialize() first.");
    }

    // 1. Encode Soil Type categorical feature
    int soilEncoded = _soils.indexOf(soilType);
    if (soilEncoded == -1) {
      soilEncoded = 2; // Default to 'Loamy' (index 2) if not found
    }

    // 2. Encode Crop Type categorical feature
    int cropEncoded = _crops.indexOf(cropType);
    if (cropDynamicIndex(cropType) == -1) {
      cropEncoded = 0; // Default fallback to first class
    }

    // 3. Scale continuous variables using training stats
    double scaledTemp = _scaleValue(temperature, _means[0], _stds[0]);
    double scaledHumid = _scaleValue(humidity, _means[1], _stds[1]);
    double scaledMoist = _scaleValue(moisture, _means[2], _stds[2]);
    double scaledN = _scaleValue(nitrogen, _means[3], _stds[3]);
    double scaledK = _scaleValue(potassium, _means[4], _stds[4]);
    double scaledP = _scaleValue(phosphorous, _means[5], _stds[5]);

    // 4. Assemble input feature tensor [1, 8]
    // Feature columns indices: Temp(0), Humid(1), Moist(2), Soil_Encoded(3), Crop_Encoded(4), N(5), K(6), P(7)
    final Float32List featureArray = Float32List(8);
    featureArray[0] = scaledTemp;
    featureArray[1] = scaledHumid;
    featureArray[2] = scaledMoist;
    featureArray[3] = soilEncoded.toDouble();
    featureArray[4] = cropEncoded.toDouble();
    featureArray[5] = scaledN;
    featureArray[6] = scaledK;
    featureArray[7] = scaledP;

    final input = featureArray.reshape([1, 8]);

    // 5. Prepare output vector for predictions [1, 7]
    final numClasses = _fertilizers!.length;
    final output = List<double>.filled(numClasses, 0.0).reshape([1, numClasses]);

    // 6. Run inference
    _interpreter!.run(input, output);

    // 7. Extract the top prediction class
    final List<double> probabilities = List<double>.from(output[0]);
    
    int bestClassIndex = 0;
    double maxConfidence = -1.0;
    for (int i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxConfidence) {
        maxConfidence = probabilities[i];
        bestClassIndex = i;
      }
    }

    final String recommendedFertilizer = _fertilizers![bestClassIndex];

    return {
      "fertilizer": recommendedFertilizer,
      "confidence": maxConfidence,
      "probabilities": probabilities,
    };
  }

  /// Helper to safely search crop indices with case tolerance.
  int cropDynamicIndex(String cropType) {
    for (int i = 0; i < _crops.length; i++) {
      if (_crops[i].toLowerCase() == cropType.toLowerCase()) {
        return i;
      }
    }
    return -1;
  }
}
