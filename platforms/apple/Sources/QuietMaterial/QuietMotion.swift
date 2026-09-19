import SwiftUI
import Foundation

/// MD3's seven easing curves. Emphasized uses two cubics joined at the canonical point.
public enum QuietMotionCurve: CaseIterable {
    case standard, standardAccelerate, standardDecelerate
    case emphasized, emphasizedAccelerate, emphasizedDecelerate, linear

    public func transform(_ progress: Double) -> Double {
        let time = min(1, max(0, progress))
        if time == 0 || time == 1 { return time }
        if self == .emphasized {
            let x = QuietTokens.easingEmphasizedJoinX
            let y = QuietTokens.easingEmphasizedJoinY
            return time <= x
                ? Self.cubic(time / x, QuietTokens.easingEmphasizedFirst) * y
                : y + Self.cubic((time - x) / (1 - x), QuietTokens.easingEmphasizedSecond) * (1 - y)
        }
        return Self.cubic(time, controlPoints!)
    }

    fileprivate var controlPoints: [Double]? {
        switch self {
        case .standard: return QuietTokens.easingStandard
        case .standardAccelerate: return QuietTokens.easingStandardAccelerate
        case .standardDecelerate: return QuietTokens.easingStandardDecelerate
        case .emphasizedAccelerate: return QuietTokens.easingEmphasizedAccelerate
        case .emphasizedDecelerate: return QuietTokens.easingEmphasizedDecelerate
        case .linear: return QuietTokens.easingLinear
        case .emphasized: return nil
        }
    }

    // Invert the x coordinate, then evaluate y. No single-cubic approximation.
    private static func cubic(_ time: Double, _ points: [Double]) -> Double {
        func at(_ t: Double, _ a: Double, _ b: Double) -> Double {
            3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t
        }
        var lower = 0.0
        var upper = 1.0
        for _ in 0..<28 {
            let middle = (lower + upper) / 2
            if at(middle, points[0], points[2]) < time { lower = middle } else { upper = middle }
        }
        return at((lower + upper) / 2, points[1], points[3])
    }
}

public enum QuietMotionSpeed { case fast, `default`, slow }
public enum QuietSpringScheme { case standard, expressive }

/// Curves representable by one native timing curve. Emphasized is intentionally
/// available through QuietMotionProgress, because it has two segments.
public enum QuietCubicCurve {
    case standard, standardAccelerate, standardDecelerate
    case emphasizedAccelerate, emphasizedDecelerate, linear
    fileprivate var curve: QuietMotionCurve {
        switch self {
        case .standard: return .standard
        case .standardAccelerate: return .standardAccelerate
        case .standardDecelerate: return .standardDecelerate
        case .emphasizedAccelerate: return .emphasizedAccelerate
        case .emphasizedDecelerate: return .emphasizedDecelerate
        case .linear: return .linear
        }
    }
}

public enum QuietMotion {
    /// Cubic MD3 animations. Use QuietMotionProgress for the emphasized segmented curve.
    public static func animation(
        _ curve: QuietCubicCurve = .standard,
        milliseconds: Double = QuietTokens.durationShort3,
        reduceMotion: Bool = false
    ) -> Animation? {
        guard !reduceMotion else { return nil }
        let p = curve.curve.controlPoints!
        return .timingCurve(p[0], p[1], p[2], p[3], duration: max(0, milliseconds) / 1000)
    }

    /// Unit-mass spring; MD3 tokens express damping as a ratio, SwiftUI expects a coefficient.
    public static func spring(
        speed: QuietMotionSpeed = .default,
        effects: Bool = false,
        scheme: QuietSpringScheme = .standard,
        reduceMotion: Bool = false
    ) -> Animation? {
        guard !reduceMotion else { return nil }
        let damping: Double
        let stiffness: Double
        if effects {
            switch speed {
            case .fast: damping = QuietTokens.springStandardFastEffectsDamping; stiffness = QuietTokens.springStandardFastEffectsStiffness
            case .default: damping = QuietTokens.springStandardDefaultEffectsDamping; stiffness = QuietTokens.springStandardDefaultEffectsStiffness
            case .slow: damping = QuietTokens.springStandardSlowEffectsDamping; stiffness = QuietTokens.springStandardSlowEffectsStiffness
            }
        } else if scheme == .expressive {
            switch speed {
            case .fast: damping = QuietTokens.springExpressiveFastSpatialDamping; stiffness = QuietTokens.springExpressiveFastSpatialStiffness
            case .default: damping = QuietTokens.springExpressiveDefaultSpatialDamping; stiffness = QuietTokens.springExpressiveDefaultSpatialStiffness
            case .slow: damping = QuietTokens.springExpressiveSlowSpatialDamping; stiffness = QuietTokens.springExpressiveSlowSpatialStiffness
            }
        } else {
            switch speed {
            case .fast: damping = QuietTokens.springStandardFastSpatialDamping; stiffness = QuietTokens.springStandardFastSpatialStiffness
            case .default: damping = QuietTokens.springStandardDefaultSpatialDamping; stiffness = QuietTokens.springStandardDefaultSpatialStiffness
            case .slow: damping = QuietTokens.springStandardSlowSpatialDamping; stiffness = QuietTokens.springStandardSlowSpatialStiffness
            }
        }
        return .interpolatingSpring(mass: 1, stiffness: stiffness, damping: 2 * damping * sqrt(stiffness))
    }
}

/// A finite 0→1 / 1→0 transition, with exact emphasized progress on iOS 16 / macOS 13.
/// Drive opacity/geometry in the content closure. State, hit testing, focus and navigation
/// remain the product's responsibility. For interrupted reversible motion prefer springs.
public struct QuietMotionProgress<Content: View>: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let target: Double
    private let milliseconds: Double
    private let curve: QuietMotionCurve
    private let content: (Double) -> Content

    public init(
        progress: Double,
        milliseconds: Double = QuietTokens.durationLong2,
        curve: QuietMotionCurve = .emphasized,
        @ViewBuilder content: @escaping (Double) -> Content
    ) {
        self.target = min(1, max(0, progress))
        self.milliseconds = max(0, milliseconds)
        self.curve = curve
        self.content = content
    }

    public var body: some View {
        QuietMotionFrame(progress: target, returning: target == 0, curve: curve, content: content)
            .animation(reduceMotion ? nil : .linear(duration: milliseconds / 1000), value: target)
    }
}

private struct QuietMotionFrame<Content: View>: View, Animatable {
    var progress: Double
    let returning: Bool
    let curve: QuietMotionCurve
    let content: (Double) -> Content
    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }
    var body: some View {
        content(returning ? 1 - curve.transform(1 - progress) : curve.transform(progress))
    }
}
