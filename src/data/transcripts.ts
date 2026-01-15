import type { TranscriptExample } from '../types';

export const transcriptExamples: TranscriptExample[] = [
  {
    use_case: 'it_support',
    pass1: {
      transcript: {
        fr: "Ouais bonjour euh... alors voilà j'appelle parce que j'ai un souci avec mon ordinateur, enfin c'est un PC que j'ai acheté chez vous y'a pas longtemps, je sais plus exactement quand, peut-être deux semaines ou trois. Donc le problème c'est que quand je joue, enfin quand je lance un jeu quoi, l'écran devient noir d'un coup. Noir complet. Et après faut que je redémarre tout. C'est super chiant parce que moi je fais du stream sur Twitch, enfin j'essaie de lancer ma chaîne quoi, et là bah je peux rien faire. Ah et c'est une RTX machin, je sais plus le numéro exact. Voilà c'est ça en gros.",
        en: "Yeah hello uh... so I'm calling because I have an issue with my computer, well it's a PC I bought from you not long ago, I don't remember exactly when, maybe two or three weeks. So the problem is that when I play, well when I launch a game, the screen goes black suddenly. Completely black. And then I have to restart everything. It's super annoying because I do streaming on Twitch, well I'm trying to launch my channel, and now I can't do anything. Oh and it's an RTX something, I don't remember the exact number. That's basically it."
      },
      fields: {
        use_case: 'it_support',
        device: 'PC gaming avec RTX',
        symptoms: 'Écran noir au lancement de jeux, nécessite redémarrage',
        impact: 'Activité de streaming impossible',
        category: 'hardware',
        priority: 'high',
        tags: [],
        language: 'fr'
      },
      missingFields: ['frequency', 'environment', 'actions_tried']
    },
    pass2: {
      transcript: {
        fr: "Ah oui pardon. Alors ça fait depuis... bah depuis hier en fait, ça a commencé hier soir. Et ça le fait à chaque fois que je lance un jeu, genre 100% du temps. J'ai essayé de mettre à jour les drivers avec GeForce Experience là, mais ça change rien. J'ai aussi essayé un autre écran, celui de ma copine, même problème. Ah et je suis sur Windows 11.",
        en: "Oh yes sorry. So it's been since... well since yesterday actually, it started last night. And it happens every time I launch a game, like 100% of the time. I tried updating the drivers with GeForce Experience, but it doesn't change anything. I also tried another screen, my girlfriend's, same problem. Oh and I'm on Windows 11."
      },
      fields: {
        frequency: 'Systématique depuis hier, 100% des lancements',
        environment: 'Windows 11, drivers mis à jour via GeForce Experience',
        actions_tried: 'Mise à jour drivers, test autre écran',
        priority: 'critical',
        tags: ['urgent', 'recurring']
      },
      prompt: {
        fr: "Depuis quand ce problème se produit-il et à quelle fréquence ? Avez-vous déjà essayé quelque chose pour le résoudre ?",
        en: "Since when does this problem occur and how frequently? Have you already tried anything to resolve it?"
      }
    }
  },
  {
    use_case: 'it_support',
    pass1: {
      transcript: {
        fr: "Bonjour, c'est pour un clavier. Un clavier sans fil que vous m'avez vendu. Il marche plus. Enfin il marchait très bien avant hein, je l'utilise depuis... pfff je sais pas, quelques mois. Et là d'un coup plus rien, les touches répondent pas. J'ai changé les piles, j'ai mis des piles neuves Duracell là, mais ça fait rien. Je comprends pas. C'est un Logitech je crois. Ou Microsoft, je sais plus. Gris en tout cas.",
        en: "Hello, it's about a keyboard. A wireless keyboard you sold me. It doesn't work anymore. Well it worked very well before, I've been using it for... I don't know, a few months. And suddenly nothing, the keys don't respond. I changed the batteries, I put new Duracell batteries, but it doesn't do anything. I don't understand. It's a Logitech I think. Or Microsoft, I don't remember. Gray anyway."
      },
      fields: {
        use_case: 'it_support',
        device: 'Clavier sans fil (Logitech ou Microsoft, gris)',
        symptoms: 'Touches ne répondent plus',
        actions_tried: 'Remplacement des piles',
        category: 'peripheral',
        priority: 'medium',
        tags: [],
        language: 'fr'
      },
      missingFields: ['frequency', 'environment', 'impact']
    },
    pass2: {
      transcript: {
        fr: "Euh c'est depuis ce matin en fait. Je l'ai allumé ce matin, ça marchait pas. Hier soir ça marchait encore. C'est sur un PC Windows, un PC fixe. J'en ai besoin pour bosser donc c'est quand même embêtant là.",
        en: "Uh it's since this morning actually. I turned it on this morning, it didn't work. Last night it still worked. It's on a Windows PC, a desktop PC. I need it to work so it's really annoying."
      },
      fields: {
        frequency: 'Depuis ce matin, hier soir OK',
        environment: 'PC fixe Windows',
        impact: 'Blocage pour le travail',
        priority: 'high',
        tags: ['urgent']
      },
      prompt: {
        fr: "Depuis quand exactement le clavier ne fonctionne plus ? Sur quel ordinateur l'utilisez-vous ?",
        en: "Since when exactly does the keyboard not work anymore? On which computer do you use it?"
      }
    }
  },
  {
    use_case: 'ecommerce',
    pass1: {
      transcript: {
        fr: "Allô bonjour, oui alors j'ai un problème avec une commande. J'ai commandé des baskets, des Nike Air Max je crois, ou des Air Force, enfin des Nike blanches quoi. Et elles sont pas arrivées. Ça fait... attendez... ça fait bientôt deux semaines je pense. Le truc c'est que sur le site de suivi là, Colissimo, ça dit que c'est livré. Mais j'ai rien reçu moi ! J'ai regardé partout, chez les voisins, dans le local poubelle, rien. Mon numéro de commande c'est euh... attendez je cherche... 78432 voilà.",
        en: "Hello, yes so I have a problem with an order. I ordered sneakers, Nike Air Max I think, or Air Force, well white Nikes. And they didn't arrive. It's been... wait... it's been almost two weeks I think. The thing is that on the tracking site, Colissimo, it says it's delivered. But I received nothing! I looked everywhere, at the neighbors, in the trash room, nothing. My order number is uh... wait I'm looking... 78432 there."
      },
      fields: {
        use_case: 'ecommerce',
        order_number: '78432',
        problem_type: 'Colis non reçu malgré statut "livré"',
        product_description: 'Baskets Nike blanches (Air Max ou Air Force)',
        delivery_status: 'Marqué livré sur Colissimo',
        actions_tried: 'Vérifié voisins et local poubelle',
        category: 'delivery',
        priority: 'high',
        tags: [],
        language: 'fr'
      },
      missingFields: ['desired_resolution', 'purchase_date']
    },
    pass2: {
      transcript: {
        fr: "Ah oui. Bah idéalement je voudrais les recevoir quoi, les chaussures. Mais si c'est pas possible, remboursez-moi. J'ai commandé le... le 15 novembre je crois. Ou le 16. Mi-novembre en tout cas. Ah et j'ai essayé d'appeler Colissimo mais impossible de les avoir, 45 minutes d'attente j'ai abandonné.",
        en: "Oh yes. Well ideally I would like to receive them, the shoes. But if it's not possible, refund me. I ordered on... on November 15th I think. Or the 16th. Mid-November anyway. Oh and I tried to call Colissimo but impossible to reach them, 45 minutes waiting I gave up."
      },
      fields: {
        desired_resolution: 'Réexpédition prioritaire, sinon remboursement',
        purchase_date: 'Mi-novembre (15-16)',
        actions_tried: 'Vérifié voisins et local poubelle + Tentative appel Colissimo (abandonné)',
        tags: ['escalation']
      },
      prompt: {
        fr: "Qu'attendez-vous de notre part : un remboursement ou une réexpédition ? Vous souvenez-vous de la date de commande ?",
        en: "What do you expect from us: a refund or a reshipping? Do you remember the order date?"
      }
    }
  },
  {
    use_case: 'ecommerce',
    pass1: {
      transcript: {
        fr: "Bonjour, voilà j'ai reçu ma commande mais c'est pas la bonne taille. J'avais commandé du 44 et j'ai reçu du 42. C'est des mocassins marron. Le problème c'est que je les voulais pour un mariage ce week-end donc voilà quoi. Mon numéro c'est... 78501. Je sais pas comment vous avez fait cette erreur franchement, c'était bien marqué 44 sur ma commande j'ai vérifié.",
        en: "Hello, so I received my order but it's not the right size. I ordered size 44 and received size 42. They're brown loafers. The problem is I wanted them for a wedding this weekend so there you go. My number is... 78501. I don't know how you made this mistake honestly, it was clearly marked 44 on my order I checked."
      },
      fields: {
        use_case: 'ecommerce',
        order_number: '78501',
        problem_type: 'Mauvaise taille reçue (42 au lieu de 44)',
        product_description: 'Mocassins marron',
        impact: 'Nécessaire pour mariage ce week-end',
        category: 'wrong_item',
        priority: 'high',
        tags: [],
        language: 'fr'
      },
      missingFields: ['desired_resolution', 'delivery_status']
    },
    pass2: {
      transcript: {
        fr: "Bah un échange évidemment, je veux mes chaussures en 44 ! Mais il faudrait que je les aie avant samedi, c'est possible ça ? J'ai reçu le colis avant-hier, donc lundi.",
        en: "Well an exchange obviously, I want my shoes in size 44! But I would need them before Saturday, is that possible? I received the package the day before yesterday, so Monday."
      },
      fields: {
        desired_resolution: 'Échange taille 44, livraison avant samedi',
        delivery_status: 'Reçu lundi',
        tags: ['urgent', 'vip_customer'],
        priority: 'critical'
      },
      prompt: {
        fr: "Souhaitez-vous un échange ou un remboursement ? Quand avez-vous reçu le colis ?",
        en: "Do you want an exchange or a refund? When did you receive the package?"
      }
    }
  },
  {
    use_case: 'saas',
    pass1: {
      transcript: {
        fr: "Bonjour, j'appelle parce qu'on a un gros problème avec votre CRM là. En fait quand on essaie d'exporter les rapports en PDF, ça plante. Ça mouline, ça mouline, et après y'a une erreur. On peut pas bosser là, toute l'équipe commerciale est bloquée. On a une réunion avec la direction demain matin et on a besoin de ces rapports. Ah et ça le fait que quand y'a plus de 100 lignes je crois. Les petits rapports ça passe.",
        en: "Hello, I'm calling because we have a big problem with your CRM. Actually when we try to export reports to PDF, it crashes. It spins, it spins, and then there's an error. We can't work, the whole sales team is blocked. We have a meeting with management tomorrow morning and we need these reports. Oh and it only happens when there are more than 100 lines I think. Small reports work fine."
      },
      fields: {
        use_case: 'saas',
        feature: 'Export rapports PDF',
        symptoms: 'Plantage après chargement, erreur affichée',
        impact: 'Équipe commerciale bloquée, réunion direction demain',
        frequency: 'Quand plus de 100 lignes',
        category: 'bug',
        priority: 'critical',
        tags: [],
        language: 'fr'
      },
      missingFields: ['environment', 'steps_to_reproduce']
    },
    pass2: {
      transcript: {
        fr: "On est sur Chrome, dernière version. Windows 11 pour la plupart, y'en a peut-être un ou deux sur Mac je sais pas. Pour reproduire bah... on va dans Rapports, on clique sur Ventes Q4, et on fait Exporter PDF. Et là ça plante. Enfin pas tout de suite, ça tourne 30 secondes et après erreur. Le message dit un truc comme 'timeout' je crois.",
        en: "We're on Chrome, latest version. Windows 11 for most, maybe one or two on Mac I don't know. To reproduce well... we go to Reports, click on Q4 Sales, and do Export PDF. And then it crashes. Well not immediately, it spins for 30 seconds and then error. The message says something like 'timeout' I think."
      },
      fields: {
        environment: 'Chrome dernière version, Windows 11 (majoritaire)',
        steps_to_reproduce: 'Rapports → Ventes Q4 → Exporter PDF → timeout ~30s',
        tags: ['urgent', 'recurring']
      },
      prompt: {
        fr: "Quel navigateur et système utilisez-vous ? Pouvez-vous décrire les étapes exactes pour reproduire le problème ?",
        en: "Which browser and system are you using? Can you describe the exact steps to reproduce the problem?"
      }
    }
  },
  {
    use_case: 'saas',
    pass1: {
      transcript: {
        fr: "Salut, c'est pas vraiment un bug mais une suggestion. Ça serait vraiment bien d'avoir un filtre par date sur le tableau de bord principal. Parce que là pour voir les données d'une période précise, on est obligé de tout exporter dans Excel et de filtrer à la main. C'est pas pratique du tout. Mes commerciaux me demandent ça depuis des mois.",
        en: "Hi, it's not really a bug but a suggestion. It would be really great to have a date filter on the main dashboard. Because now to see data for a specific period, we have to export everything to Excel and filter manually. It's not practical at all. My sales people have been asking me for this for months."
      },
      fields: {
        use_case: 'saas',
        feature: 'Tableau de bord - filtres',
        symptoms: 'Absence de filtre par date',
        impact: 'Export Excel obligatoire, perte de temps',
        category: 'feature_request',
        priority: 'low',
        tags: [],
        language: 'fr'
      },
      missingFields: ['frequency', 'steps_to_reproduce', 'environment']
    },
    pass2: {
      transcript: {
        fr: "Ça fait plusieurs mois qu'on galère avec ça. Je dirais au moins 6 mois. On utilise Chrome principalement, mais c'est pareil sur tous les navigateurs vu que c'est une fonctionnalité qui manque. C'est pas hyper urgent, mais ce serait vraiment apprécié.",
        en: "We've been struggling with this for several months. I'd say at least 6 months. We mainly use Chrome, but it's the same on all browsers since it's a missing feature. It's not super urgent, but it would be really appreciated."
      },
      fields: {
        frequency: 'Besoin permanent depuis 6 mois',
        environment: 'Chrome (tous navigateurs concernés)',
        tags: []
      },
      prompt: {
        fr: "Depuis combien de temps rencontrez-vous ce besoin ? Utilisez-vous un navigateur particulier ?",
        en: "How long have you had this need? Do you use a particular browser?"
      }
    }
  },
  {
    use_case: 'dev_portal',
    pass1: {
      transcript: {
        fr: "Salut, je vous contacte pour signaler un bug sur le portail. En fait quand on clique deux fois sur Sauvegarder, enfin si on clique vite deux fois, ça crée des doublons dans la base. Genre la même entrée apparaît deux fois. C'est assez gênant parce qu'après on sait plus c'est laquelle la bonne. Ça nous est arrivé plusieurs fois cette semaine.",
        en: "Hi, I'm contacting you to report a bug on the portal. Actually when you double-click on Save, well if you click twice quickly, it creates duplicates in the database. Like the same entry appears twice. It's quite annoying because then we don't know which one is the right one. This happened to us several times this week."
      },
      fields: {
        use_case: 'dev_portal',
        request_type: 'Bug',
        description: 'Double-clic Sauvegarder crée des doublons',
        context: 'Plusieurs fois cette semaine',
        category: 'bug',
        priority: 'high',
        tags: [],
        language: 'fr'
      },
      missingFields: ['urgency', 'expected_behavior']
    },
    pass2: {
      transcript: {
        fr: "Oui c'est quand même urgent parce qu'on doit nettoyer les doublons à la main et on perd du temps. Normalement bah... soit le bouton devrait se griser après le premier clic, soit ça devrait ignorer le deuxième clic quoi. C'est du bon sens. On aimerait que ce soit corrigé rapidement.",
        en: "Yes it's still urgent because we have to clean up the duplicates manually and we're losing time. Normally well... either the button should gray out after the first click, or it should ignore the second click. It's common sense. We would like it to be fixed quickly."
      },
      fields: {
        urgency: 'Urgent (nettoyage manuel coûteux)',
        expected_behavior: 'Bouton grisé ou second clic ignoré',
        tags: ['urgent'],
        priority: 'critical'
      },
      prompt: {
        fr: "C'est urgent pour vous ? Et quel comportement attendriez-vous normalement ?",
        en: "Is this urgent for you? And what behavior would you normally expect?"
      }
    }
  },
  {
    use_case: 'dev_portal',
    pass1: {
      transcript: {
        fr: "Bonjour, j'ai une remarque concernant votre documentation. Quand on veut implémenter l'authentification OAuth, y'a vraiment pas assez d'exemples. J'ai passé deux heures à chercher comment faire et j'ai dû aller sur Stack Overflow pour trouver. C'est dommage parce que le reste de la doc est plutôt bien fait.",
        en: "Hello, I have a comment about your documentation. When you want to implement OAuth authentication, there really aren't enough examples. I spent two hours looking for how to do it and had to go to Stack Overflow to find it. It's a shame because the rest of the doc is pretty well done."
      },
      fields: {
        use_case: 'dev_portal',
        request_type: 'Documentation',
        description: 'Manque d\'exemples pour authentification OAuth',
        impact: '2h de recherche, recours à Stack Overflow',
        category: 'documentation',
        priority: 'medium',
        tags: [],
        language: 'fr'
      },
      missingFields: ['urgency', 'context']
    },
    pass2: {
      transcript: {
        fr: "C'est pas hyper urgent, on a trouvé un workaround. Mais pour les prochains développeurs qui vont utiliser votre API, ce serait vraiment mieux. On utilise OAuth pour connecter notre app mobile à vos services. Des exemples en Python et JavaScript seraient top.",
        en: "It's not super urgent, we found a workaround. But for the next developers who will use your API, it would be really better. We use OAuth to connect our mobile app to your services. Examples in Python and JavaScript would be great."
      },
      fields: {
        urgency: 'Pas urgent, workaround trouvé',
        context: 'App mobile, connexion API, Python/JS souhaités',
        ideas_needs: 'Exemples Python et JavaScript',
        tags: ['workaround_available']
      },
      prompt: {
        fr: "Quel niveau d'urgence donneriez-vous à cette amélioration ? Dans quel contexte utilisez-vous OAuth ?",
        en: "What level of urgency would you give to this improvement? In what context do you use OAuth?"
      }
    }
  }
];
