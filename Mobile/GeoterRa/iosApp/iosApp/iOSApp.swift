import SwiftUI
import Shared

@main
struct iOSApp: App {
    init() {
        initKoinIos.shared.start()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}