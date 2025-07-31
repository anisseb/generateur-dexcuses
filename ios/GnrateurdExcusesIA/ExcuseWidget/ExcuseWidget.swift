import WidgetKit
import SwiftUI

struct ExcuseWidget: Widget {
    let kind: String = "ExcuseWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: ExcuseConfigurationIntent.self, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                ExcuseWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                ExcuseWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Générateur d'Excuses")
        .description("Générez rapidement une excuse personnalisée")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct ExcuseWidgetEntryView: View {
    var entry: Provider.Entry
    
    var body: some View {
        GeometryReader { geometry in
            VStack(alignment: .leading, spacing: 8) {
                // En-tête avec icône et titre
                HStack {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .foregroundColor(.blue)
                        .font(.title2)
                    
                    Text("Excuse")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    // Indicateur de paramètres
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(entry.configuration.category?.displayString ?? "Retard")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        
                        Text(entry.configuration.credibility?.displayString ?? "Réaliste")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                
                // Contenu de l'excuse
                if geometry.size.height > 100 {
                    ScrollView {
                        Text(entry.excuse)
                            .font(.body)
                            .multilineTextAlignment(.leading)
                            .foregroundColor(.primary)
                            .lineLimit(nil)
                    }
                } else {
                    Text(entry.excuse)
                        .font(.caption)
                        .lineLimit(3)
                        .foregroundColor(.primary)
                }
                
                Spacer()
                
                // Pied de page avec horodatage
                HStack {
                    Text("Générée le")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Text(entry.date, style: .time)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    // Bouton de rafraîchissement visuel
                    Image(systemName: "arrow.clockwise")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            .padding()
        }
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.blue.opacity(0.1), Color.purple.opacity(0.1)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

struct Provider: IntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            excuse: "Désolé, j'ai eu un problème de transport en commun inattendu ce matin.",
            configuration: ExcuseConfigurationIntent()
        )
    }

    func getSnapshot(for configuration: ExcuseConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(
            date: Date(),
            excuse: generateExcuse(for: configuration),
            configuration: configuration
        )
        completion(entry)
    }

    func getTimeline(for configuration: ExcuseConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Générer des entrées pour les 5 prochaines heures
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(
                date: entryDate,
                excuse: generateExcuse(for: configuration),
                configuration: configuration
            )
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
    
    private func generateExcuse(for configuration: ExcuseConfigurationIntent) -> String {
        let excuseGenerator = ExcuseGenerator()
        return excuseGenerator.generateExcuse(
            category: configuration.category ?? .retard,
            credibility: configuration.credibility ?? .realiste,
            tone: configuration.tone ?? .serieux
        )
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let excuse: String
    let configuration: ExcuseConfigurationIntent
}

#Preview(as: .systemSmall) {
    ExcuseWidget()
} timeline: {
    SimpleEntry(
        date: .now,
        excuse: "Désolé, j'ai eu un problème de transport en commun inattendu ce matin.",
        configuration: ExcuseConfigurationIntent()
    )
}