import SwiftUI

public enum QuietButtonKind: Equatable { case filled, tonal, outlined, text, elevated }
public enum QuietChipKind: Equatable { case assist, suggestion, filter, input }
public enum QuietCardKind: Equatable { case filled, outlined, elevated }

/// Graphite marks the current destination or row; white marks the one chosen option.
/// Selection is never signalled by hue, only by this fill and label pair.
enum QuietSelectionEmphasis {
    case destination, choice
    var fill: Color {
        switch self {
        case .destination: return QuietTokens.colorPrimaryContainer
        case .choice: return QuietTokens.colorPrimary
        }
    }
    var label: Color {
        switch self {
        case .destination: return QuietTokens.colorOnPrimaryContainer
        case .choice: return QuietTokens.colorOnPrimary
        }
    }
}

public struct QuietAction: Identifiable {
    public let id: String
    public let label: String
    public let systemImage: String?
    public let enabled: Bool
    public let perform: () -> Void
    public init(id: String, label: String, systemImage: String? = nil,
                enabled: Bool = true, perform: @escaping () -> Void) {
        self.id = id; self.label = label; self.systemImage = systemImage
        self.enabled = enabled; self.perform = perform
    }
}

public struct QuietChoice: Identifiable, Hashable {
    public let id: String
    public let label: String
    public let systemImage: String
    public init(id: String, label: String, systemImage: String = "circle") {
        self.id = id; self.label = label; self.systemImage = systemImage
    }
}

/// Native Button semantics, Quiet colors and state layer. No custom gesture recognizer.
public struct QuietActionButton: View {
    private let label: String
    private let kind: QuietButtonKind
    private let action: () -> Void
    public init(_ label: String, kind: QuietButtonKind = .filled, action: @escaping () -> Void) {
        self.label = label; self.kind = kind; self.action = action
    }
    public var body: some View {
        Button(label, action: action).buttonStyle(QuietVariantButtonStyle(kind: kind))
    }
}

private struct QuietVariantButtonStyle: ButtonStyle {
    let kind: QuietButtonKind
    @Environment(\.isEnabled) private var enabled
    @Environment(\.accessibilityReduceMotion) private var reduced
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).fixedSize(horizontal: false, vertical: true)
            .padding(.horizontal, QuietTokens.space6).padding(.vertical, QuietTokens.space3)
            .frame(minWidth: QuietTokens.sizeTouchTarget, minHeight: QuietTokens.sizeTouchTarget)
            .foregroundStyle(enabled ? labelColor : QuietTokens.colorDisabled)
            .background(enabled ? fillColor : disabledFill, in: Capsule())
            .overlay(Capsule().stroke(kind == .outlined
                ? (enabled ? QuietTokens.colorOutline : QuietTokens.colorDisabled) : Color.clear,
                lineWidth: QuietTokens.borderWidth))
            .overlay(Capsule().fill(labelColor)
                .opacity(configuration.isPressed && enabled ? QuietTokens.statePressed : 0).allowsHitTesting(false))
            .contentShape(Capsule())
            .shadow(color: kind == .elevated ? QuietTokens.elevationLevel1Color : Color.clear,
                radius: QuietTokens.elevationLevel1Blur / 2, y: QuietTokens.elevationLevel1OffsetY)
            .animation(QuietMotion.animation(.standard, milliseconds: QuietTokens.durationShort3,
                reduceMotion: reduced), value: configuration.isPressed)
    }
    // Filled carries the strong white action, tonal the graphite step; text and outlined stay quiet.
    private var fillColor: Color {
        switch kind {
        case .filled: return QuietTokens.colorAction
        case .tonal: return QuietTokens.colorPrimaryContainer
        case .elevated: return QuietTokens.colorSurfaceLow
        case .outlined, .text: return Color.clear
        }
    }
    private var labelColor: Color {
        switch kind {
        case .filled: return QuietTokens.colorOnAction
        case .tonal: return QuietTokens.colorOnPrimaryContainer
        case .elevated, .outlined, .text: return QuietTokens.colorText
        }
    }
    // A quiet action stays quiet when it is inactive; a filled one drops to the recessed surface.
    private var disabledFill: Color {
        switch kind {
        case .outlined, .text: return Color.clear
        case .filled, .tonal, .elevated: return QuietTokens.colorSurfaceLow
        }
    }
}

public struct QuietIconButton: View {
    private let label: String
    private let image: String
    private let action: () -> Void
    public init(_ label: String, systemImage: String, action: @escaping () -> Void) {
        self.label = label; image = systemImage; self.action = action
    }
    public var body: some View {
        Button(action: action) {
            Image(systemName: image)
                .frame(minWidth: QuietTokens.sizeTouchTarget, minHeight: QuietTokens.sizeTouchTarget)
                .contentShape(Capsule())
        }
            .buttonStyle(.plain).accessibilityLabel(label).help(label)
    }
}

public struct QuietFab: View {
    private let label: String
    private let image: String
    private let extended: Bool
    private let action: () -> Void
    public init(_ label: String, systemImage: String, extended: Bool = false,
                action: @escaping () -> Void) {
        self.label = label; image = systemImage; self.extended = extended; self.action = action
    }
    public var body: some View {
        Button(action: action) {
            HStack(spacing: QuietTokens.space3) { Image(systemName: image); if extended { Text(label) } }
                .padding(QuietTokens.space4)
                .frame(minWidth: 56, minHeight: 56) // 56pt - standard FAB geometry, no spacing step matches
                .foregroundStyle(QuietTokens.colorOnPrimaryContainer)
                .background(QuietTokens.colorPrimaryContainer,
                            in: RoundedRectangle(cornerRadius: QuietTokens.radiusControl, style: .continuous))
                .shadow(color: QuietTokens.elevationLevel3Color,
                        radius: QuietTokens.elevationLevel3Blur / 2, y: QuietTokens.elevationLevel3OffsetY)
        }.buttonStyle(.plain).accessibilityLabel(label)
    }
}

public struct QuietButtonGroup: View {
    private let actions: [QuietAction]
    public init(_ actions: [QuietAction]) { self.actions = actions }
    public var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: QuietTokens.space2) { buttons }
            VStack(alignment: .leading, spacing: QuietTokens.space2) { buttons }
        }
    }
    private var buttons: some View {
        ForEach(actions) { item in QuietActionButton(item.label, action: item.perform).disabled(!item.enabled) }
    }
}

public struct QuietMenu: View {
    private let label: String
    private let actions: [QuietAction]
    public init(_ label: String, actions: [QuietAction]) { self.label = label; self.actions = actions }
    public var body: some View {
        Menu(label) { ForEach(actions) { item in
            Button(action: item.perform) {
                if let image = item.systemImage { Label(item.label, systemImage: image) }
                else { Text(item.label) }
            }.disabled(!item.enabled)
        } }.frame(minWidth: QuietTokens.sizeTouchTarget, minHeight: QuietTokens.sizeTouchTarget)
            .tint(QuietTokens.colorPrimary)
    }
}

public struct QuietSplitButton: View {
    private let primary: QuietAction
    private let menuLabel: String
    private let actions: [QuietAction]
    public init(primary: QuietAction, menuLabel: String, actions: [QuietAction]) {
        self.primary = primary; self.menuLabel = menuLabel; self.actions = actions
    }
    public var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: QuietTokens.space1) { primaryButton; QuietMenu(menuLabel, actions: actions) }
            VStack(alignment: .leading, spacing: QuietTokens.space1) { primaryButton; QuietMenu(menuLabel, actions: actions) }
        }
    }
    private var primaryButton: some View {
        QuietActionButton(primary.label, action: primary.perform).disabled(!primary.enabled)
    }
}

public struct QuietFabMenu: View {
    private let label: String
    private let actions: [QuietAction]
    public init(_ label: String, actions: [QuietAction]) { self.label = label; self.actions = actions }
    public var body: some View {
        QuietMenu(label, actions: actions).padding(.horizontal, QuietTokens.space4)
            .background(QuietTokens.colorPrimaryContainer,
                        in: RoundedRectangle(cornerRadius: QuietTokens.radiusControl, style: .continuous))
    }
}

public struct QuietSegments: View {
    private let label: String
    private let choices: [QuietChoice]
    @Binding private var selection: String
    public init(_ label: String, choices: [QuietChoice], selection: Binding<String>) {
        self.label = label; self.choices = choices; _selection = selection
    }
    public var body: some View {
        HStack(spacing: QuietTokens.space0) {
            ForEach(choices) { item in
                let chosen = selection == item.id
                Button { selection = item.id } label: {
                    Text(item.label).font(.subheadline)
                        .padding(.horizontal, QuietTokens.space4)
                        .frame(maxWidth: .infinity, minHeight: QuietTokens.sizeTouchTarget)
                        .foregroundStyle(chosen ? QuietTokens.colorOnPrimary : QuietTokens.colorText)
                        .background(chosen ? QuietTokens.colorPrimary : Color.clear, in: Capsule())
                        .contentShape(Capsule())
                }.buttonStyle(.plain).accessibilityAddTraits(chosen ? .isSelected : [])
            }
        }.frame(minHeight: QuietTokens.sizeTouchTarget)
            .background(QuietTokens.colorSurfaceLow, in: Capsule())
            // The track edge identifies the control, so it takes the functional outline.
            .overlay(Capsule().stroke(QuietTokens.colorOutline, lineWidth: QuietTokens.borderWidth))
            .accessibilityElement(children: .contain).accessibilityLabel(label)
    }
}

public struct QuietChip: View {
    private let label: String
    private let kind: QuietChipKind
    private let selected: Bool
    private let action: () -> Void
    private let remove: (() -> Void)?
    private let removeLabel: String
    public init(_ label: String, kind: QuietChipKind = .assist, selected: Bool = false,
                removeLabel: String = "Remove", onRemove: (() -> Void)? = nil,
                action: @escaping () -> Void) {
        self.label = label; self.kind = kind; self.selected = selected
        self.removeLabel = removeLabel; remove = onRemove; self.action = action
    }
    public var body: some View {
        HStack(spacing: QuietTokens.space0) {
            Button(action: action) {
                HStack(spacing: QuietTokens.space2) { if selected { Image(systemName: "checkmark") }; Text(label) }
                    .padding(.horizontal, QuietTokens.space4).frame(minHeight: QuietTokens.sizeTouchTarget)
                    .contentShape(Capsule())
            }.buttonStyle(.plain).accessibilityAddTraits(selected ? .isSelected : [])
            if kind == .input, let remove {
                QuietIconButton(removeLabel + " " + label, systemImage: "xmark", action: remove)
            }
        }.foregroundStyle(selected ? QuietTokens.colorOnPrimary : QuietTokens.colorTextMuted)
        .background(selected ? QuietTokens.colorPrimary : Color.clear, in: Capsule())
        .overlay(Capsule().stroke(selected ? Color.clear : QuietTokens.colorOutline,
                                 lineWidth: QuietTokens.borderWidth))
    }
}

public struct QuietBadge<Content: View>: View {
    private let text: String?
    private let content: Content
    public init(_ text: String? = nil, @ViewBuilder content: () -> Content) {
        self.text = text; self.content = content()
    }
    public var body: some View {
        content.overlay(alignment: .topTrailing) {
            if let text { Text(text).font(.caption2).padding(QuietTokens.space1)
                .background(QuietTokens.colorDanger, in: Capsule()).foregroundStyle(QuietTokens.colorDangerContainer) }
            else { Circle().fill(QuietTokens.colorDanger)
                .frame(width: 6, height: 6) } // 6pt - badge dot glyph geometry, no spacing step matches
        }
    }
}

public struct QuietProgress: View {
    private let label: String
    private let value: Double?
    private let circular: Bool
    @Environment(\.accessibilityReduceMotion) private var reduced
    public init(_ label: String, value: Double? = nil, circular: Bool = false) {
        self.label = label; self.value = value; self.circular = circular
    }
    public var body: some View {
        Group {
            if circular {
                // 4pt stroke and a 40pt dial are indicator geometry; no spacing step matches either.
                if let value { ZStack { Circle().stroke(QuietTokens.colorSurfaceHigh, lineWidth: 4)
                    Circle().trim(from: 0, to: min(1, max(0, value))).stroke(QuietTokens.colorPrimary,
                        style: StrokeStyle(lineWidth: 4, lineCap: .round)).rotationEffect(.degrees(-90))
                }.frame(width: 40, height: 40).accessibilityValue(Text(value, format: .percent)) }
                else if reduced { Image(systemName: "hourglass").foregroundStyle(QuietTokens.colorText)
                    .frame(width: 40, height: 40) }
                else { ProgressView().progressViewStyle(.circular) }
            } else if value == nil && reduced {
                Capsule().fill(QuietTokens.colorPrimary)
                    .frame(height: 4) // 4pt - indicator bar thickness, no spacing step matches
            } else { ProgressView(value: value).progressViewStyle(.linear) }
        }.tint(QuietTokens.colorPrimary).accessibilityLabel(label)
    }
}

/// Branded contours with the same MD3 loading recipe as the web and Flutter adapters.
public struct QuietLoadingIndicator: View {
    private let label: String
    @Environment(\.accessibilityReduceMotion) private var reduced
    @Environment(\.scenePhase) private var scenePhase
    @State private var elapsed = 0.0
    @State private var position = 0.0
    @State private var velocity = 0.0
    @State private var last: Date?
    public init(_ label: String) { self.label = label }
    public var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 60.0, paused: reduced || scenePhase != .active)) { tick in
            Canvas { drawing, size in
                var drawing = drawing
                drawing.translateBy(x: size.width / 2, y: size.height / 2)
                drawing.rotate(by: .degrees(50 * elapsed / 650 + 90 * position - 90))
                let whole = Int(floor(position)), fraction = position - floor(position)
                let scale = Double(min(size.width, size.height)) / 2.3
                var path = Path()
                for index in 0..<96 {
                    let angle = Double(index) * .pi * 2 / 96
                    let radius = (contour(whole, angle) * (1 - fraction) + contour(whole + 1, angle) * fraction) * scale
                    let point = CGPoint(x: radius * cos(angle), y: radius * sin(angle))
                    if index == 0 { path.move(to: point) } else { path.addLine(to: point) }
                }
                path.closeSubpath(); drawing.fill(path, with: .color(QuietTokens.colorPrimary))
            }.onChange(of: tick.date) { now in advance(now) }
        }.frame(width: QuietTokens.sizeControl, height: QuietTokens.sizeControl).accessibilityLabel(label)
            .onChange(of: reduced) { _ in last = nil }
            .onChange(of: scenePhase) { _ in last = nil }
            .onAppear { last = nil }
    }
    private func advance(_ now: Date) {
        guard !reduced && scenePhase == .active else { last = nil; return }
        var remaining = min(64, max(0, now.timeIntervalSince(last ?? now) * 1000)); last = now
        while remaining > 0 {
            let step = min(4, remaining); remaining -= step; elapsed += step
            let target = floor(elapsed / 650) + 1, dt = step / 1000
            velocity += (200 * (target - position) - 2 * 0.6 * sqrt(200) * velocity) * dt
            position += velocity * dt
        }
    }
    private func contour(_ shape: Int, _ angle: Double) -> Double {
        switch ((shape % 7) + 7) % 7 {
        case 0: return 0.82 + 0.12 * cos(12 * angle)
        case 1: return 0.86 + 0.1 * cos(9 * angle)
        case 2: return 0.87 + 0.08 * cos(5 * angle)
        case 3: return 0.7 + 0.25 * abs(cos(angle))
        case 4: return 0.82 + 0.12 * cos(8 * angle)
        case 5: return 0.84 + 0.12 * cos(4 * angle)
        default: return 0.76 + 0.2 * abs(sin(angle))
        }
    }
}

/// Controlled snackbar: the app decides its lifetime; no accessibility-hostile auto-dismiss timer.
public struct QuietSnackbar: View {
    private let message: String
    private let action: QuietAction?
    private let dismiss: QuietAction
    public init(_ message: String, action: QuietAction? = nil, dismiss: QuietAction) {
        self.message = message; self.action = action; self.dismiss = dismiss
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space2) {
            Text(message).foregroundStyle(QuietTokens.colorText)
            HStack(spacing: QuietTokens.space4) {
                if let action { Button(action.label, action: action.perform).disabled(!action.enabled) }
                Spacer()
                Button(dismiss.label, action: dismiss.perform)
            }.frame(minHeight: QuietTokens.sizeTouchTarget).tint(QuietTokens.colorPrimary)
        }.padding(QuietTokens.space4)
        .background(QuietTokens.colorSurfaceHigh,
                    in: RoundedRectangle(cornerRadius: QuietTokens.radiusCard, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: QuietTokens.radiusCard, style: .continuous)
            .stroke(QuietTokens.colorOutlineVariant, lineWidth: QuietTokens.borderWidth))
        .shadow(color: QuietTokens.elevationLevel2Color,
                radius: QuietTokens.elevationLevel2Blur / 2, y: QuietTokens.elevationLevel2OffsetY)
    }
}

public struct QuietRichTooltip<Content: View>: View {
    @Binding private var presented: Bool
    private let title: String
    private let content: Content
    public init(_ title: String, isPresented: Binding<Bool>, @ViewBuilder content: () -> Content) {
        self.title = title; _presented = isPresented; self.content = content()
    }
    public var body: some View {
        Button(title) { presented.toggle() }.frame(minHeight: QuietTokens.sizeTouchTarget)
            .tint(QuietTokens.colorPrimary)
            .popover(isPresented: $presented) {
                QuietTheme { VStack(alignment: .leading, spacing: QuietTokens.space3) {
                    Text(title).font(.headline).foregroundStyle(QuietTokens.colorText); content }
                    .padding(QuietTokens.space6)
                    .frame(idealWidth: 280) // 280pt - tooltip reading width, no spacing step matches
                    .background(QuietTokens.colorSurfaceHigh) }
            }
    }
}

public struct QuietDivider: View {
    public init() {}
    public var body: some View { Divider().overlay(QuietTokens.colorOutlineVariant) }
}

public struct QuietListItem: View {
    private let title: String
    private let supporting: String?
    private let image: String?
    public init(_ title: String, supporting: String? = nil, systemImage: String? = nil) {
        self.title = title; self.supporting = supporting; image = systemImage
    }
    public var body: some View {
        HStack(spacing: QuietTokens.space4) {
            if let image { Image(systemName: image).accessibilityHidden(true) }
            VStack(alignment: .leading, spacing: QuietTokens.space1) {
                Text(title).foregroundStyle(QuietTokens.colorText)
                if let supporting { Text(supporting).font(.subheadline).foregroundStyle(QuietTokens.colorTextMuted) }
            }
            Spacer(minLength: 0)
        }.padding(.vertical, QuietTokens.space2).padding(.horizontal, QuietTokens.space4)
        .frame(minHeight: 56) // 56pt - one-line row height, no spacing step matches
        .background(QuietTokens.colorSurface)
    }
}

public struct QuietCarousel<Content: View>: View {
    private let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        ScrollView(.horizontal) { HStack(alignment: .top, spacing: QuietTokens.space3) { content }
            .padding(.vertical, QuietTokens.space2) }
    }
}

public struct QuietToolbar<Content: View>: View {
    private let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        ScrollView(.horizontal) { HStack(spacing: QuietTokens.space2) { content }.padding(QuietTokens.space2) }
            .background(QuietTokens.colorSurfaceHigh, in: Capsule())
            .shadow(color: QuietTokens.elevationLevel2Color,
                    radius: QuietTokens.elevationLevel2Blur / 2, y: QuietTokens.elevationLevel2OffsetY)
    }
}

public struct QuietCheckbox: View {
    private let label: String
    @Binding private var checked: Bool
    public init(_ label: String, isOn: Binding<Bool>) { self.label = label; _checked = isOn }
    public var body: some View {
        Toggle(isOn: $checked) { Text(label) }.toggleStyle(QuietCheckboxStyle())
            .frame(minHeight: QuietTokens.sizeTouchTarget)
    }
}
private struct QuietCheckboxStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        Button { configuration.isOn.toggle() } label: {
            HStack(spacing: QuietTokens.space3) {
                Image(systemName: configuration.isOn ? "checkmark.square.fill" : "square")
                    .foregroundStyle(configuration.isOn ? QuietTokens.colorPrimary : QuietTokens.colorOutline)
                configuration.label.foregroundStyle(QuietTokens.colorText) }
        }.buttonStyle(.plain).frame(minHeight: QuietTokens.sizeTouchTarget)
            .accessibilityValue(configuration.isOn ? "Checked" : "Unchecked")
    }
}

public struct QuietRadioGroup: View {
    private let label: String
    private let choices: [QuietChoice]
    @Binding private var selection: String
    public init(_ label: String, choices: [QuietChoice], selection: Binding<String>) {
        self.label = label; self.choices = choices; _selection = selection
    }
    public var body: some View {
        Picker(label, selection: $selection) { ForEach(choices) { Text($0.label).tag($0.id) } }
            .tint(QuietTokens.colorPrimary).frame(minHeight: QuietTokens.sizeTouchTarget)
    }
}

/// Two accessible native sliders share a bounded range; no inaccessible custom drag-only thumb.
public struct QuietRangeSlider: View {
    private let lowerLabel: String
    private let upperLabel: String
    private let bounds: ClosedRange<Double>
    private let step: Double
    @Binding private var lower: Double
    @Binding private var upper: Double
    public init(lowerLabel: String, upperLabel: String, lower: Binding<Double>, upper: Binding<Double>,
                in bounds: ClosedRange<Double> = 0...1, step: Double = 0.01) {
        self.lowerLabel = lowerLabel; self.upperLabel = upperLabel; _lower = lower; _upper = upper
        self.bounds = bounds; self.step = step
    }
    public var body: some View {
        VStack(spacing: QuietTokens.space3) {
            Slider(value: Binding(get: { lower }, set: { lower = min($0, upper) }), in: bounds, step: step) {
                Text(lowerLabel)
            }.accessibilityLabel(lowerLabel)
            Slider(value: Binding(get: { upper }, set: { upper = max($0, lower) }), in: bounds, step: step) {
                Text(upperLabel)
            }.accessibilityLabel(upperLabel)
        }.tint(QuietTokens.colorPrimary)
    }
}

public struct QuietDatePicker: View {
    private let label: String
    private let range: ClosedRange<Date>
    @Binding private var date: Date
    public init(_ label: String, selection: Binding<Date>, in range: ClosedRange<Date> = Date.distantPast...Date.distantFuture) {
        self.label = label; _date = selection; self.range = range
    }
    public var body: some View { DatePicker(label, selection: $date, in: range, displayedComponents: .date)
        .tint(QuietTokens.colorPrimary).frame(minHeight: QuietTokens.sizeTouchTarget) }
}

public struct QuietTimePicker: View {
    private let label: String
    @Binding private var date: Date
    public init(_ label: String, selection: Binding<Date>) { self.label = label; _date = selection }
    public var body: some View { DatePicker(label, selection: $date, displayedComponents: .hourAndMinute)
        .tint(QuietTokens.colorPrimary).frame(minHeight: QuietTokens.sizeTouchTarget) }
}

public struct QuietDateRangePicker: View {
    private let startLabel: String
    private let endLabel: String
    @Binding private var start: Date
    @Binding private var end: Date
    public init(startLabel: String, endLabel: String, start: Binding<Date>, end: Binding<Date>) {
        self.startLabel = startLabel; self.endLabel = endLabel; _start = start; _end = end
    }
    public var body: some View {
        VStack(spacing: QuietTokens.space3) {
            DatePicker(startLabel, selection: $start, in: Date.distantPast...end, displayedComponents: .date)
            DatePicker(endLabel, selection: $end, in: start...Date.distantFuture, displayedComponents: .date)
        }.tint(QuietTokens.colorPrimary)
    }
}

public struct QuietSearch<Results: View>: View {
    private let label: String
    @Binding private var query: String
    private let results: Results
    public init(_ label: String, query: Binding<String>, @ViewBuilder results: () -> Results) {
        self.label = label; _query = query; self.results = results()
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space4) { QuietTextField(LocalizedStringKey(label), text: $query); results }
    }
}

/// Native presentation preserves focus, keyboard, escape, dismissal and safe-area semantics.
public extension View {
    func quietBottomSheet<Sheet: View>(isPresented: Binding<Bool>, @ViewBuilder content: @escaping () -> Sheet) -> some View {
        sheet(isPresented: isPresented) {
            #if os(iOS)
            QuietTheme { content() }.presentationDetents([.medium, .large]).presentationDragIndicator(.visible)
            #else
            QuietTheme { content() }
            #endif
        }
    }
    func quietDialog<Actions: View, Message: View>(_ title: String, isPresented: Binding<Bool>,
        @ViewBuilder actions: () -> Actions, @ViewBuilder message: () -> Message) -> some View {
        alert(title, isPresented: isPresented, actions: actions, message: message)
    }
    func quietTooltip(_ text: String) -> some View { help(text) }
}

/// Responsive navigation with state owned above the layout. Native routing is app-owned.
public struct QuietAdaptiveNavigation<Content: View>: View {
    private let choices: [QuietChoice]
    @Binding private var selection: String
    private let content: Content
    @Environment(\.dynamicTypeSize) private var textSize
    public init(choices: [QuietChoice], selection: Binding<String>, @ViewBuilder content: () -> Content) {
        self.choices = choices; _selection = selection; self.content = content()
    }
    public var body: some View {
        GeometryReader { geometry in
            let wide = geometry.size.width >= QuietTokens.breakpointMedium && !textSize.isAccessibilitySize
            content.frame(maxWidth: .infinity, maxHeight: .infinity)
                .safeAreaInset(edge: .bottom, spacing: 0) {
                    if !wide { ScrollView(.horizontal) { HStack(spacing: QuietTokens.space2) { navigationItems } } }
                }
                .safeAreaInset(edge: .leading, spacing: 0) {
                    if wide {
                        ScrollView { VStack(alignment: .leading, spacing: QuietTokens.space2) { navigationItems } }
                            .frame(width: 180) // 180pt - rail width, no spacing step matches
                    }
                }
        }.background(QuietTokens.colorBackground)
    }
    // One destination treatment for the rail, the bar and this shell.
    private var navigationItems: some View {
        QuietNavigationItems(choices: choices, selection: $selection)
    }
}

public struct QuietField: View {
    private let label: String
    private let filled: Bool
    private let supporting: String?
    private let error: String?
    @Binding private var text: String
    public init(_ label: String, text: Binding<String>, filled: Bool = false,
                supporting: String? = nil, error: String? = nil) {
        self.label = label; _text = text; self.filled = filled
        self.supporting = supporting; self.error = error
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space2) {
            Text(label).font(.subheadline).foregroundStyle(QuietTokens.colorTextMuted).accessibilityHidden(true)
            TextField(label, text: $text).textFieldStyle(.plain)
                .foregroundStyle(QuietTokens.colorText).tint(QuietTokens.colorPrimary)
                .padding(QuietTokens.space4)
                .frame(minHeight: 56) // 56pt - field control geometry, no spacing step matches
                .background(filled ? QuietTokens.colorSurfaceHigh : QuietTokens.colorSurfaceLow,
                            in: RoundedRectangle(cornerRadius: QuietTokens.radiusControl, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: QuietTokens.radiusControl, style: .continuous)
                    .stroke(error == nil ? QuietTokens.colorOutline : QuietTokens.colorDanger,
                            lineWidth: QuietTokens.borderWidth))
                .accessibilityHint(error ?? supporting ?? "")
            if let message = error ?? supporting {
                Text(message).font(.caption).foregroundStyle(error == nil ? QuietTokens.colorTextMuted : QuietTokens.colorDanger)
            }
        }
    }
}

public struct QuietSurfaceCard<Content: View>: View {
    private let kind: QuietCardKind
    private let content: Content
    public init(kind: QuietCardKind = .filled, @ViewBuilder content: () -> Content) {
        self.kind = kind; self.content = content()
    }
    public var body: some View {
        QuietCard(fill: fill) { content }
            .shadow(color: kind == .elevated ? QuietTokens.elevationLevel1Color : Color.clear,
                    radius: QuietTokens.elevationLevel1Blur / 2, y: QuietTokens.elevationLevel1OffsetY)
    }
    // Filled sits on the default surface, outlined lets the canvas show through its grouping edge,
    // elevated steps down a surface and lifts instead.
    private var fill: Color {
        switch kind {
        case .filled: return QuietTokens.colorSurface
        case .outlined: return Color.clear
        case .elevated: return QuietTokens.colorSurfaceLow
        }
    }
}

public struct QuietSlider: View {
    private let label: String
    private let bounds: ClosedRange<Double>
    private let step: Double
    @Binding private var value: Double
    public init(_ label: String, value: Binding<Double>, in bounds: ClosedRange<Double> = 0...1,
                step: Double = 0.01) {
        self.label = label; _value = value; self.bounds = bounds; self.step = step
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space2) {
            Text(label).foregroundStyle(QuietTokens.colorText)
            Slider(value: $value, in: bounds, step: step) { Text(label) }
                .tint(QuietTokens.colorPrimary).frame(minHeight: QuietTokens.sizeTouchTarget)
        }
    }
}

public struct QuietTabs<Content: View>: View {
    private let choices: [QuietChoice]
    private let content: Content
    @Binding private var selection: String
    public init(choices: [QuietChoice], selection: Binding<String>, @ViewBuilder content: () -> Content) {
        self.choices = choices; _selection = selection; self.content = content()
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space4) {
            QuietNavigationBar(choices: choices, selection: $selection, emphasis: .choice)
            content
        }
    }
}

public struct QuietNavigationBar: View {
    private let choices: [QuietChoice]
    @Binding private var selection: String
    private let emphasis: QuietSelectionEmphasis
    public init(choices: [QuietChoice], selection: Binding<String>) {
        self.choices = choices; _selection = selection; emphasis = .destination
    }
    init(choices: [QuietChoice], selection: Binding<String>, emphasis: QuietSelectionEmphasis) {
        self.choices = choices; _selection = selection; self.emphasis = emphasis
    }
    public var body: some View {
        ScrollView(.horizontal) { HStack(spacing: QuietTokens.space1) {
            QuietNavigationItems(choices: choices, selection: $selection, emphasis: emphasis) } }
            .background(QuietTokens.colorBackground)
    }
}

public struct QuietNavigationRail: View {
    private let choices: [QuietChoice]
    @Binding private var selection: String
    public init(choices: [QuietChoice], selection: Binding<String>) { self.choices = choices; _selection = selection }
    public var body: some View {
        ScrollView { VStack(alignment: .leading, spacing: QuietTokens.space1) {
            QuietNavigationItems(choices: choices, selection: $selection) } }
            // 80/160/240pt - rail widths, no spacing step matches
            .frame(minWidth: 80, idealWidth: 160, maxWidth: 240).background(QuietTokens.colorBackground)
    }
}

private struct QuietNavigationItems: View {
    let choices: [QuietChoice]
    @Binding var selection: String
    var emphasis: QuietSelectionEmphasis = .destination
    var body: some View {
        ForEach(choices) { item in
            let current = selection == item.id
            Button { selection = item.id } label: {
                Label(item.label, systemImage: item.systemImage)
                    .padding(QuietTokens.space3).frame(minHeight: QuietTokens.sizeTouchTarget)
                    .foregroundStyle(current ? emphasis.label : QuietTokens.colorTextMuted)
                    .background(current ? emphasis.fill : Color.clear, in: Capsule())
                    .contentShape(Capsule())
            }.buttonStyle(.plain).accessibilityAddTraits(current ? .isSelected : [])
        }
    }
}

public struct QuietNavigationDrawer: View {
    private let title: String
    private let choices: [QuietChoice]
    @Binding private var selection: String
    public init(_ title: String, choices: [QuietChoice], selection: Binding<String>) {
        self.title = title; self.choices = choices; _selection = selection
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: QuietTokens.space2) {
            Text(title).font(.title2).foregroundStyle(QuietTokens.colorText).padding(QuietTokens.space4)
            QuietNavigationRail(choices: choices, selection: $selection) }
    }
}

public struct QuietAppBar<Actions: View>: View {
    private let title: String
    private let actions: Actions
    public init(_ title: String, @ViewBuilder actions: () -> Actions) {
        self.title = title; self.actions = actions()
    }
    public var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: QuietTokens.space2) { Text(title).font(.title2); Spacer(); actions }
            VStack(alignment: .leading, spacing: QuietTokens.space2) {
                Text(title).font(.title2); HStack(spacing: QuietTokens.space2) { actions } }
        }.foregroundStyle(QuietTokens.colorText).padding(QuietTokens.space4)
        .frame(minHeight: 64) // 64pt - app bar height, no spacing step matches
        .background(QuietTokens.colorBackground)
    }
}

/// Persistent supporting pane. On compact windows the host presents it as a native sheet.
public struct QuietSideSheet<Content: View>: View {
    private let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        ScrollView { content.padding(QuietTokens.space6) }
            .frame(idealWidth: 360, maxWidth: 400) // 360/400pt - supporting pane widths, no spacing step matches
            .background(QuietTokens.colorSurface)
    }
}

/// Nonmodal in-layout surface. This stable SwiftUI composition has no draggable detents.
public struct QuietStandardBottomSheet<Content: View>: View {
    private let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        content.padding(QuietTokens.space6).frame(maxWidth: .infinity)
            .background(QuietTokens.colorSurfaceHigh,
                        in: RoundedRectangle(cornerRadius: QuietTokens.radiusDialog, style: .continuous))
    }
}

public extension View {
    @ViewBuilder
    func quietFullScreenDialog<Content: View>(isPresented: Binding<Bool>, @ViewBuilder content: @escaping () -> Content) -> some View {
        #if os(iOS)
        fullScreenCover(isPresented: isPresented) { QuietTheme { content() } }
        #else
        sheet(isPresented: isPresented) { QuietTheme { content() } }
        #endif
    }
}
