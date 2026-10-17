// Lifts the foreground subject from a photograph with Apple Vision (macOS 14+)
// and writes it with a transparent background. Used for the "Let it flow"
// portrait: swift scripts/lift-subject.swift <in> <out.png>
import CoreImage
import Foundation
import Vision

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let handler = VNImageRequestHandler(url: input)
let request = VNGenerateForegroundInstanceMaskRequest()
do {
  try handler.perform([request])
  guard let result = request.results?.first else { print("no foreground found"); exit(1) }
  print("instances:", result.allInstances.count)
  let masked = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
  let image = CIImage(cvPixelBuffer: masked)
  try CIContext().writePNGRepresentation(of: image, to: output, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
  print("wrote", output.path, Int(image.extent.width), "x", Int(image.extent.height))
} catch {
  print("vision error:", error)
  exit(2)
}
