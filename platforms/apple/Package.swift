// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "QuietMaterial",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "QuietMaterial", targets: ["QuietMaterial"])],
    targets: [.target(name: "QuietMaterial")]
)
