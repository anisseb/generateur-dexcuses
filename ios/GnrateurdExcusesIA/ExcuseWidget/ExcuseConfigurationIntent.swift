import Intents
import Foundation

@objc(ExcuseConfigurationIntent)
class ExcuseConfigurationIntent: INIntent {
    
}

// Énumérations pour les paramètres du widget
@objc public enum ExcuseCategory: Int, CaseIterable {
    case retard = 0
    case ghost = 1
    case devoir = 2
    case travail = 3
    case rendezVous = 4
    case autre = 5
    
    var displayString: String {
        switch self {
        case .retard: return "Retard"
        case .ghost: return "Ghost"
        case .devoir: return "Devoir"
        case .travail: return "Travail"
        case .rendezVous: return "Rendez-vous"
        case .autre: return "Autre"
        }
    }
    
    var identifier: String {
        switch self {
        case .retard: return "retard"
        case .ghost: return "ghost"
        case .devoir: return "devoir"
        case .travail: return "travail"
        case .rendezVous: return "rendez-vous"
        case .autre: return "autre"
        }
    }
}

@objc public enum ExcuseCredibility: Int, CaseIterable {
    case realiste = 0
    case credule = 1
    case mytho = 2
    
    var displayString: String {
        switch self {
        case .realiste: return "Réaliste"
        case .credule: return "Crédule"
        case .mytho: return "Mytho"
        }
    }
    
    var identifier: String {
        switch self {
        case .realiste: return "realiste"
        case .credule: return "credule"
        case .mytho: return "mytho"
        }
    }
}

@objc public enum ExcuseTone: Int, CaseIterable {
    case serieux = 0
    case drole = 1
    case surrealiste = 2
    case limite = 3
    
    var displayString: String {
        switch self {
        case .serieux: return "Sérieux"
        case .drole: return "Drôle"
        case .surrealiste: return "Surréaliste"
        case .limite: return "Limite"
        }
    }
    
    var identifier: String {
        switch self {
        case .serieux: return "serieux"
        case .drole: return "drôle"
        case .surrealiste: return "surrealiste"
        case .limite: return "limite"
        }
    }
}

extension ExcuseConfigurationIntent {
    @NSManaged public var category: ExcuseCategory
    @NSManaged public var credibility: ExcuseCredibility
    @NSManaged public var tone: ExcuseTone
}