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
/// The tint comes from the appearance, so no system accent reaches a control.
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

/// Native Button semantics with an MD3 pressed state layer; no arbitrary press scaling.
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
            .foregroundStyle(isEnabled ? appearance.onAction : QuietTokens.colorDisabled)
            .background(isEnabled ? appearance.action : QuietTokens.colorSurfaceLow, in: Capsule())
            .overlay(Capsule().fill(appearance.onAction)
                .opacity(configuration.isPressed && isEnabled ? QuietTokens.statePressed : 0)
                .allowsHitTesting(false))
            .contentShape(Capsule())
            .animation(QuietMotion.animation(.standard,
                milliseconds: QuietTokens.durationShort3, reduceMotion: reduceMotion),
                value: configuration.isPressed)
    }
}

/// A noninteractive surface; place a native Button inside for an action.
/// The grouping edge is decorative, so it uses the outline variant, never the control outline.
public struct QuietCard<Content: View>: View {
    private let fill: Color
    private let content: Content
    public init(@ViewBuilder content: () -> Content) {
        fill = QuietTokens.colorSurface
        self.content = content()
    }
    init(fill: Color, @ViewBuilder content: () -> Content) {
        self.fill = fill
        self.content = content()
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space4) { content }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(QuietTokens.space6)
            .background(fill,
                        in: RoundedRectangle(cornerRadius: QuietTokens.radiusCard,
                                             style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: QuietTokens.radiusCard, style: .continuous)
                .stroke(QuietTokens.colorOutlineVariant, lineWidth: QuietTokens.borderWidth))
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
                .foregroundStyle(QuietTokens.colorText)
                .tint(QuietTokens.colorPrimary)
                .padding(.horizontal, QuietTokens.space4)
                .padding(.vertical, QuietTokens.space3)
                .frame(minHeight: QuietTokens.sizeTouchTarget)
                .background(QuietTokens.colorSurfaceLow,
                            in: RoundedRectangle(cornerRadius: QuietTokens.radiusControl,
                                                 style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: QuietTokens.radiusControl, style: .continuous)
                    .stroke(QuietTokens.colorOutline, lineWidth: QuietTokens.borderWidth))
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
                .foregroundStyle(QuietTokens.colorText)
        }
        .toggleStyle(.switch)
        .tint(QuietTokens.colorPrimary)
        .frame(minHeight: QuietTokens.sizeTouchTarget)
    }
}
