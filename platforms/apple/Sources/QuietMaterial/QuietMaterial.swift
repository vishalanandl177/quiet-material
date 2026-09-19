import SwiftUI

/// Semantic component colors. The root canvas remains black.
public struct QuietAppearance {
    public var accent: Color = QuietTokens.colorPrimary
    public var action: Color = QuietTokens.colorAction
    public var onAction: Color = QuietTokens.colorOnAction
    public init() {}
}

private struct QuietAppearanceKey: EnvironmentKey {
    static let defaultValue = QuietAppearance()
}

public extension EnvironmentValues {
    var quietAppearance: QuietAppearance {
        get { self[QuietAppearanceKey.self] }
        set { self[QuietAppearanceKey.self] = newValue }
    }
}

/// Wrap each app window and sheet. Only the background ignores safe areas.
public struct QuietTheme<Content: View>: View {
    private let appearance: QuietAppearance
    private let content: Content
    public init(appearance: QuietAppearance = .init(), @ViewBuilder content: () -> Content) {
        self.appearance = appearance
        self.content = content()
    }
    public var body: some View {
        ZStack {
            QuietTokens.colorBackground.ignoresSafeArea()
            content
        }
        .foregroundStyle(QuietTokens.colorText)
        .tint(appearance.accent)
        .environment(\.quietAppearance, appearance)
        .preferredColorScheme(.dark)
    }
}

/// Native Button semantics with Quiet Material's restrained press response.
public struct QuietButtonStyle: ButtonStyle {
    @Environment(\.quietAppearance) private var appearance
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.isEnabled) private var isEnabled
    public init() {}
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
            .padding(.horizontal, QuietTokens.space6)
            .padding(.vertical, QuietTokens.space3)
            .frame(minWidth: QuietTokens.sizeTouchTarget, minHeight: QuietTokens.sizeTouchTarget)
            .foregroundStyle(isEnabled ? appearance.onAction : QuietTokens.colorTextMuted)
            .background(isEnabled ? appearance.action : QuietTokens.colorSurfaceHigh, in: Capsule())
            .contentShape(Capsule())
            .opacity(configuration.isPressed && isEnabled ? 0.86 : 1)
            .scaleEffect(configuration.isPressed && !reduceMotion && isEnabled ? 0.98 : 1)
            .animation(reduceMotion ? nil : .timingCurve(0.2, 0, 0, 1,
                duration: QuietTokens.durationShort / 1000), value: configuration.isPressed)
    }
}

/// A noninteractive surface; place a native Button inside for an action.
public struct QuietCard<Content: View>: View {
    private let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space4) { content }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(QuietTokens.space6)
            .background(QuietTokens.colorSurface,
                        in: RoundedRectangle(cornerRadius: QuietTokens.radiusCardCompact,
                                             style: .continuous))
    }
}

/// A persistent visible label and the platform's native editing behavior.
public struct QuietTextField: View {
    private let title: LocalizedStringKey
    @Binding private var text: String
    public init(_ title: LocalizedStringKey, text: Binding<String>) {
        self.title = title
        self._text = text
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space2) {
            Text(title).font(.subheadline).foregroundStyle(QuietTokens.colorTextMuted)
                .accessibilityHidden(true)
            TextField(title, text: $text)
                .font(.body)
                .textFieldStyle(.plain)
                .padding(.horizontal, QuietTokens.space4)
                .padding(.vertical, QuietTokens.space3)
                .frame(minHeight: QuietTokens.sizeTouchTarget)
                .background(QuietTokens.colorBackground,
                            in: RoundedRectangle(cornerRadius: QuietTokens.radiusControl))
                .overlay(RoundedRectangle(cornerRadius: QuietTokens.radiusControl)
                    .stroke(QuietTokens.colorOutline, lineWidth: 1))
        }
    }
}

public struct QuietToggle: View {
    private let title: LocalizedStringKey
    @Binding private var isOn: Bool
    public init(_ title: LocalizedStringKey, isOn: Binding<Bool>) {
        self.title = title
        self._isOn = isOn
    }
    public var body: some View {
        Toggle(isOn: $isOn) {
            Text(title).font(.body).fixedSize(horizontal: false, vertical: true)
        }
        .toggleStyle(.switch)
        .frame(minHeight: QuietTokens.sizeTouchTarget)
    }
}
