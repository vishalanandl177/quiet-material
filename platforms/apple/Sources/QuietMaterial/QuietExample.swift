import SwiftUI

/// Runnable example for iPhone, iPad and resizable macOS windows.
public struct QuietExample: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var projectName = "Personal workspace"
    @State private var notifications = false
    @State private var showingDetails = false
    public init() {}

    public var body: some View {
        QuietTheme {
            NavigationStack {
                GeometryReader { geometry in
                    let expanded = geometry.size.width >= QuietTokens.breakpointExpanded
                        && !dynamicTypeSize.isAccessibilitySize
                    ScrollView {
                        VStack(alignment: .leading, spacing: QuietTokens.space6) {
                            Text("A little more focus.")
                                .font(.largeTitle).fontWeight(.semibold)
                                .fixedSize(horizontal: false, vertical: true)
                                .accessibilityAddTraits(.isHeader)
                            Text("Only what you need, with space to think.")
                                .font(.body).foregroundStyle(QuietTokens.colorTextMuted)
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible(),
                                spacing: QuietTokens.space6, alignment: .top),
                                count: expanded ? 2 : 1), alignment: .leading,
                                spacing: QuietTokens.space6) {
                                QuietCard {
                                    Text("Your workspace").font(.title2)
                                        .accessibilityAddTraits(.isHeader)
                                    QuietTextField("Workspace name", text: $projectName)
                                    QuietToggle("Receive notifications", isOn: $notifications)
                                    Button("Review preferences") { showingDetails = true }
                                        .buttonStyle(QuietButtonStyle())
                                }
                                QuietCard {
                                    Text("Room to breathe").font(.title2)
                                        .accessibilityAddTraits(.isHeader)
                                    Text("Cards stack on a phone and sit side by side when the window has enough space. Larger accessibility text returns to one column.")
                                        .font(.body).fixedSize(horizontal: false, vertical: true)
                                    NavigationLink("Read the details") { details }
                                        .buttonStyle(QuietButtonStyle())
                                }
                            }
                        }
                        .frame(maxWidth: QuietTokens.sizeContent, alignment: .leading)
                        .padding(geometry.size.width >= QuietTokens.breakpointMedium
                            ? QuietTokens.layoutPagePaddingMedium
                            : QuietTokens.layoutPagePaddingCompact)
                        .frame(maxWidth: .infinity)
                    }
                    .background(QuietTokens.colorBackground)
                }
                .navigationTitle("Quiet Material")
                .quietNavigationCanvas()
            }
        }
        .sheet(isPresented: $showingDetails) {
            QuietTheme {
                ScrollView {
                    VStack(alignment: .leading, spacing: QuietTokens.space6) {
                        Text("Your preferences").font(.title)
                            .accessibilityAddTraits(.isHeader)
                        Text(projectName).font(.body)
                        Text(notifications ? "Notifications are on." : "Notifications are off.")
                            .font(.body)
                        Button("Done") { showingDetails = false }
                            .buttonStyle(QuietButtonStyle())
                    }
                    .padding(QuietTokens.space6)
                }
                // 280/440/260pt - sheet window geometry, no spacing step matches
                .frame(minWidth: 280, idealWidth: 440, minHeight: 260)
            }
        }
    }

    private var details: some View {
        QuietTheme {
            ScrollView {
                Text("Native navigation preserves familiar back gestures, keyboard behavior, and accessibility. Apply the shared tokens to your product while keeping these platform conventions.")
                    .font(.body).padding(QuietTokens.space6)
                    .frame(maxWidth: QuietTokens.sizeReading, alignment: .leading)
            }
        }
        .navigationTitle("Details")
        .quietNavigationCanvas()
    }
}

private extension View {
    @ViewBuilder
    func quietNavigationCanvas() -> some View {
        #if os(iOS)
        self.toolbarBackground(QuietTokens.colorBackground, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
        #else
        self
        #endif
    }
}
