import Foundation

class ExcuseGenerator {
    
    // Base d'excuses organisée par catégorie, crédibilité et ton
    private let excuseTemplates: [String: [String: [String: [String]]]] = [
        "retard": [
            "realiste": [
                "serieux": [
                    "Désolé, j'ai eu un problème de transport en commun",
                    "J'ai eu un imprévu familial urgent",
                    "Ma voiture n'a pas démarré ce matin",
                    "J'ai eu un problème de santé mineur",
                    "Il y avait des embouteillages exceptionnels"
                ],
                "drôle": [
                    "Mon chat a caché mes clés",
                    "J'ai oublié de mettre mon réveil",
                    "J'ai eu une crise existentielle dans ma salle de bain",
                    "Mon GPS m'a fait faire le tour du monde",
                    "J'ai été hypnotisé par mon petit-déjeuner"
                ],
                "surrealiste": [
                    "Un trou noir s'est ouvert dans ma chambre",
                    "Les extraterrestres ont kidnappé mon réveil",
                    "J'ai été transformé en escargot pendant 2 heures",
                    "Un ninja invisible a volé mes chaussures",
                    "Mon reflet a refusé de sortir du miroir"
                ],
                "limite": [
                    "J'ai dû sauver un bébé d'un incendie",
                    "J'ai été retenu par la CIA pour interrogatoire",
                    "J'ai gagné au loto mais j'ai perdu le ticket",
                    "J'ai été nommé président d'un pays lointain",
                    "Une météorite a détruit mon quartier"
                ]
            ],
            "credule": [
                "serieux": [
                    "J'ai eu un accident de voiture mineur",
                    "J'ai dû emmener quelqu'un aux urgences",
                    "Ma maison a été inondée",
                    "J'ai eu un problème technique majeur",
                    "J'ai été bloqué dans un ascenseur"
                ],
                "drôle": [
                    "Mon chien a mangé mes vêtements",
                    "J'ai été piégé dans mon ascenseur",
                    "J'ai eu une panne de courant",
                    "Mon téléphone a explosé",
                    "J'ai été poursuivi par des abeilles"
                ],
                "surrealiste": [
                    "J'ai été téléporté dans une dimension parallèle",
                    "Un dragon a bloqué ma route",
                    "J'ai eu une conversation avec mon reflet",
                    "Les pigeons ont formé une barricade",
                    "Mon ombre s'est rebellée contre moi"
                ],
                "limite": [
                    "J'ai été kidnappé par des ninjas",
                    "J'ai dû arrêter un braquage de banque",
                    "J'ai été choisi pour une mission secrète",
                    "J'ai eu une crise d'identité multiple",
                    "J'ai sauvé le monde d'une invasion alien"
                ]
            ],
            "mytho": [
                "serieux": [
                    "J'ai été hospitalisé d'urgence",
                    "J'ai eu un accident grave",
                    "Ma famille a eu un drame",
                    "J'ai été victime d'un crime",
                    "J'ai été témoin d'un événement traumatisant"
                ],
                "drôle": [
                    "J'ai été transformé en légume",
                    "J'ai eu une conversation avec Dieu",
                    "J'ai été élu roi d'un royaume lointain",
                    "J'ai découvert que j'étais un super-héros",
                    "J'ai été adopté par une famille de manchots"
                ],
                "surrealiste": [
                    "J'ai voyagé dans le temps",
                    "J'ai été contacté par des aliens",
                    "J'ai fusionné avec mon téléphone",
                    "J'ai eu une crise de super-pouvoirs",
                    "J'ai découvert un portail vers Narnia"
                ],
                "limite": [
                    "J'ai sauvé le monde d'une invasion zombie",
                    "J'ai été recruté par le MI6",
                    "J'ai eu une révélation divine",
                    "J'ai été choisi par une prophétie ancienne",
                    "J'ai découvert que je suis l'élu"
                ]
            ]
        ],
        "ghost": [
            "realiste": [
                "serieux": [
                    "J'ai eu des problèmes personnels",
                    "J'ai été très occupé avec le travail",
                    "J'ai eu des soucis de santé",
                    "J'ai eu besoin de temps pour moi",
                    "J'ai traversé une période difficile"
                ],
                "drôle": [
                    "Mon téléphone a fait une grève",
                    "J'ai été kidnappé par ma couette",
                    "J'ai eu une crise de paresse aiguë",
                    "Mon chat a changé mon mot de passe",
                    "J'ai été en hibernation sociale"
                ]
            ]
        ],
        "travail": [
            "realiste": [
                "serieux": [
                    "J'ai eu un problème technique urgent",
                    "J'ai dû gérer une crise familiale",
                    "J'ai eu des complications de santé",
                    "J'ai eu un problème de transport",
                    "J'ai eu une urgence personnelle"
                ],
                "drôle": [
                    "Mon ordinateur a pris sa retraite",
                    "J'ai été attaqué par des emails",
                    "Ma motivation s'est évaporée",
                    "J'ai eu un bug existentiel",
                    "Mon café m'a trahi"
                ]
            ]
        ]
    ]
    
    func generateExcuse(category: ExcuseCategory, credibility: ExcuseCredibility, tone: ExcuseTone) -> String {
        let categoryKey = category.identifier
        let credibilityKey = credibility.identifier
        let toneKey = tone.identifier
        
        // Récupérer les excuses pour la combinaison donnée
        if let categoryExcuses = excuseTemplates[categoryKey],
           let credibilityExcuses = categoryExcuses[credibilityKey],
           let toneExcuses = credibilityExcuses[toneKey],
           !toneExcuses.isEmpty {
            return toneExcuses.randomElement() ?? getDefaultExcuse()
        }
        
        // Fallback vers des excuses par défaut si la combinaison n'existe pas
        return getDefaultExcuse()
    }
    
    private func getDefaultExcuse() -> String {
        let defaultExcuses = [
            "Désolé, j'ai eu un imprévu",
            "J'ai eu un problème technique",
            "J'ai été retardé par des circonstances imprévues",
            "J'ai eu une urgence de dernière minute",
            "Il y a eu un malentendu dans mon planning"
        ]
        return defaultExcuses.randomElement() ?? "Désolé pour le retard"
    }
    
    // Méthode pour générer une excuse enrichie avec du contexte
    func generateEnrichedExcuse(category: ExcuseCategory, credibility: ExcuseCredibility, tone: ExcuseTone, context: String? = nil) -> String {
        let baseExcuse = generateExcuse(category: category, credibility: credibility, tone: tone)
        
        // Ajouter du contexte si fourni
        if let context = context, !context.isEmpty {
            return "\(baseExcuse). \(context)"
        }
        
        // Ajouter des détails selon le ton et la crédibilité
        let enrichment = generateEnrichment(for: credibility, tone: tone)
        if !enrichment.isEmpty {
            return "\(baseExcuse). \(enrichment)"
        }
        
        return baseExcuse
    }
    
    private func generateEnrichment(for credibility: ExcuseCredibility, tone: ExcuseTone) -> String {
        switch (credibility, tone) {
        case (.realiste, .serieux):
            return ["Je m'excuse sincèrement", "Cela ne se reproduira pas", "J'espère que vous comprendrez"].randomElement() ?? ""
        case (.realiste, .drole):
            return ["C'est du vécu je vous assure", "La vie est pleine de surprises", "Même moi je n'y crois pas"].randomElement() ?? ""
        case (.credule, .serieux):
            return ["Les détails sont confidentiels", "C'était vraiment inattendu", "Je ne pouvais pas prévoir"].randomElement() ?? ""
        case (.mytho, .limite):
            return ["Je ne peux pas en dire plus", "C'est classé secret défense", "Vous ne me croiriez pas"].randomElement() ?? ""
        default:
            return ""
        }
    }
}